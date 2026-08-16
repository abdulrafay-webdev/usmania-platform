from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import (
    User, Role, Permission, PasswordResetToken,
    UserCreate, UserUpdate, UserResponse
)
from app.services.auth_service import hash_password, generate_reset_token
from app.services.email_service import send_password_reset_email
from app.dependencies import require_permission, get_current_user

router = APIRouter(prefix="/api/users", tags=["Users Management"])

def format_user(user: User, session: Session) -> UserResponse:
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

@router.get("", response_model=List[UserResponse])
def list_users(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "view"))
):
    users = session.exec(select(User).order_by(User.created_at.desc())).all()
    return [format_user(u, session) for u in users]


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "create"))
):
    email_clean = payload.email.lower().strip()
    existing = session.exec(select(User).where(User.email == email_clean)).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email address already exists.")

    role = session.get(Role, payload.role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Selected role not found.")

    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    hashed_pwd = hash_password(payload.password)
    new_user = User(
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hashed_pwd,
        role_id=payload.role_id,
        is_active=payload.is_active,
        token_version=1
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return format_user(new_user, session)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(require_permission("settings_users", "edit"))
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.email:
        email_clean = payload.email.lower().strip()
        existing = session.exec(select(User).where(User.email == email_clean, User.id != user_id)).first()
        if existing:
            raise HTTPException(status_code=400, detail="This email is already used by another user.")
        user.email = email_clean

    if payload.name:
        user.name = payload.name.strip()

    # Protect primary Super Admin from demotion or deactivation
    if user.email == "usmaniatrust@gmail.com":
        super_admin_role = session.exec(select(Role).where(Role.name == "Super Admin")).first()
        if payload.role_id and super_admin_role and payload.role_id != super_admin_role.id:
            raise HTTPException(status_code=400, detail="The primary Super Admin account cannot be demoted.")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="The primary Super Admin account cannot be deactivated.")

    if payload.role_id:
        role = session.get(Role, payload.role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found.")
        user.role_id = payload.role_id

    if payload.is_active is not None:
        # Prevent admin from accidentally deactivating their own account
        if user.id == current_admin.id and payload.is_active is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own logged-in account.")
        user.is_active = payload.is_active

    if payload.password and len(payload.password.strip()) >= 6:
        user.password_hash = hash_password(payload.password.strip())
        user.token_version = (user.token_version or 1) + 1

    session.add(user)
    session.commit()
    session.refresh(user)

    return format_user(user, session)


@router.post("/{user_id}/reset-password")
def trigger_user_password_reset(
    user_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "edit"))
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Generate token and send email
    raw_token, token_hash = generate_reset_token()
    expires_at = datetime.now() + timedelta(minutes=30)

    reset_entry = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False
    )
    session.add(reset_entry)
    session.commit()

    send_password_reset_email(to_email=user.email, user_name=user.name, raw_token=raw_token)

    return {"message": f"Password reset email successfully sent to {user.email}"}
