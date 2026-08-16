from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import (
    User, Role, Permission, PasswordResetToken,
    LoginRequest, ForgotPasswordRequest, ResetPasswordRequest,
    UserResponse, RoleResponse, PermissionDTO, AuthMeResponse
)
from app.services.auth_service import (
    hash_password, verify_password, create_access_token,
    generate_reset_token, hash_raw_token
)
from app.services.email_service import send_password_reset_email
from app.dependencies import get_current_user, get_user_permissions

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_user_response(user: User, session: Session) -> UserResponse:
    role = session.get(Role, user.role_id)
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role_id=user.role_id,
        role_name=role.name if role else "Unknown",
        is_active=user.is_active,
        created_at=user.created_at,
        last_login_at=user.last_login_at
    )

def format_role_response(role: Role, session: Session) -> RoleResponse:
    perms = session.exec(select(Permission).where(Permission.role_id == role.id)).all()
    perm_dtos = [
        PermissionDTO(
            module=p.module,
            can_view=p.can_view,
            can_create=p.can_create,
            can_edit=p.can_edit,
            can_delete=p.can_delete
        ) for p in perms
    ]
    return RoleResponse(
        id=role.id,
        name=role.name,
        description=role.description or "",
        is_system_role=role.is_system_role,
        created_at=role.created_at,
        permissions=perm_dtos
    )

@router.post("/login")
def login(payload: LoginRequest, response: Response, session: Session = Depends(get_session)):
    email_clean = payload.email.lower().strip()
    user = session.exec(select(User).where(User.email == email_clean)).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the administrator."
        )
    
    # Update last login timestamp
    user.last_login_at = datetime.now()
    session.add(user)
    session.commit()
    session.refresh(user)

    # Issue JWT Token
    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role_id": user.role_id,
        "token_version": user.token_version
    }
    access_token = create_access_token(token_payload)

    # Set HTTP-only secure cookie
    response.set_cookie(
        key="jwt_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=86400 * 7 # 7 days
    )

    role = session.get(Role, user.role_id)
    permissions = get_user_permissions(user, session)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": format_user_response(user, session),
        "role": format_role_response(role, session) if role else None,
        "permissions": permissions
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="jwt_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=AuthMeResponse)
def get_me(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    role = session.get(Role, current_user.role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Assigned role not found")
    
    permissions = get_user_permissions(current_user, session)

    return AuthMeResponse(
        user=format_user_response(current_user, session),
        role=format_role_response(role, session),
        permissions=permissions
    )


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, session: Session = Depends(get_session)):
    email_clean = payload.email.lower().strip()
    user = session.exec(select(User).where(User.email == email_clean)).first()

    # Always return a standard security message whether user exists or not
    generic_msg = "If an account with this email exists, a password reset link has been sent to your email."

    if not user or not user.is_active:
        return {"message": generic_msg}

    # Generate token & hash
    raw_token, token_hash = generate_reset_token()
    expires_at = datetime.now() + timedelta(minutes=30)

    # Save to database
    reset_entry = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False
    )
    session.add(reset_entry)
    session.commit()

    # Send email in background / sync
    send_password_reset_email(to_email=user.email, user_name=user.name, raw_token=raw_token)

    return {"message": generic_msg}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, session: Session = Depends(get_session)):
    if not payload.token or not payload.new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")
    
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    # Hash raw token to compare with DB
    token_hash = hash_raw_token(payload.token.strip())

    statement = select(PasswordResetToken).where(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False
    )
    reset_token = session.exec(statement).first()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset link."
        )

    # Check 30-minute expiration
    if datetime.now() > reset_token.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset link has expired (valid for 30 minutes). Please request a new one."
        )

    user = session.get(User, reset_token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Update password and increment token_version (invalidating old sessions)
    user.password_hash = hash_password(payload.new_password)
    user.token_version = (user.token_version or 1) + 1
    reset_token.used = True

    session.add(user)
    session.add(reset_token)
    session.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}
