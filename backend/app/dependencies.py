from typing import Dict, Any, Callable
from fastapi import Request, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import User, Role, Permission, ALL_MODULES
from app.services.auth_service import decode_access_token

def get_current_user(
    request: Request,
    session: Session = Depends(get_session)
) -> User:
    """
    Extracts and validates JWT from Authorization header or HTTP-only cookie.
    Loads fresh User record from database and verifies active status.
    """
    token = None
    
    # 1. Check Authorization Bearer header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1].strip()
    
    # 2. Check query parameter (essential for direct browser downloads like PDF & Excel)
    if not token:
        token = request.query_params.get("token")

    # 3. Check HTTP-only cookie if header/param not provided
    if not token:
        token = request.cookies.get("jwt_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload["sub"]
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated. Please contact an administrator."
        )
    
    # Invalidate old sessions if token_version was incremented on password reset
    token_ver = payload.get("token_version", 1)
    if user.token_version != token_ver:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password was changed. Please log in again with your new password."
        )
    
    return user


def get_user_permissions(user: User, session: Session) -> Dict[str, Dict[str, bool]]:
    """Loads fresh granular permissions dictionary from database for the user's assigned role."""
    role = session.get(Role, user.role_id)
    if not role:
        # Default all False
        return {
            m: {"can_view": False, "can_create": False, "can_edit": False, "can_delete": False}
            for m in ALL_MODULES
        }
    
    perms = session.exec(select(Permission).where(Permission.role_id == role.id)).all()
    perm_dict = {}
    for p in perms:
        perm_dict[p.module] = {
            "can_view": p.can_view,
            "can_create": p.can_create,
            "can_edit": p.can_edit,
            "can_delete": p.can_delete
        }
    
    # Fill any missing modules with False
    for m in ALL_MODULES:
        if m not in perm_dict:
            perm_dict[m] = {"can_view": False, "can_create": False, "can_edit": False, "can_delete": False}
            
    return perm_dict


def require_permission(module: str, action: str) -> Callable:
    """
    Dependency factory to enforce granular RBAC per endpoint.
    Example: Depends(require_permission('students', 'create'))
    """
    def permission_checker(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ) -> User:
        # Super Admin role check bypass
        role = session.get(Role, current_user.role_id)
        if role and role.name == "Super Admin":
            return current_user
            
        perms = get_user_permissions(current_user, session)
        mod_perms = perms.get(module, {})
        flag_key = f"can_{action}"
        
        has_perm = mod_perms.get(flag_key, False)
        if not has_perm:
            action_labels = {
                "view": "view records in",
                "create": "create new entries in",
                "edit": "edit records in",
                "delete": "delete records in"
            }
            desc = action_labels.get(action, f"{action} in")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Your role does not have permission to {desc} {module.replace('_', ' ').title()}."
            )
        
        return current_user

    return permission_checker
