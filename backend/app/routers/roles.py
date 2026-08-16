from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import (
    Role, Permission, User, ALL_MODULES,
    RoleCreate, RoleUpdate, RolePermissionsUpdate,
    RoleResponse, PermissionDTO
)
from app.dependencies import require_permission, get_current_user

router = APIRouter(prefix="/api/roles", tags=["Roles & Permissions Management"])

def format_role(role: Role, session: Session) -> RoleResponse:
    perms = session.exec(select(Permission).where(Permission.role_id == role.id)).all()
    perm_map = {p.module: p for p in perms}
    
    perm_dtos = []
    for mod in ALL_MODULES:
        if mod in perm_map:
            p = perm_map[mod]
            perm_dtos.append(
                PermissionDTO(
                    module=p.module,
                    can_view=p.can_view,
                    can_create=p.can_create,
                    can_edit=p.can_edit,
                    can_delete=p.can_delete
                )
            )
        else:
            perm_dtos.append(
                PermissionDTO(
                    module=mod,
                    can_view=False,
                    can_create=False,
                    can_edit=False,
                    can_delete=False
                )
            )
            
    return RoleResponse(
        id=role.id,
        name=role.name,
        description=role.description or "",
        is_system_role=role.is_system_role,
        created_at=role.created_at,
        permissions=perm_dtos
    )

@router.get("", response_model=List[RoleResponse])
def list_roles(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "view"))
):
    roles = session.exec(select(Role).order_by(Role.is_system_role.desc(), Role.name.asc())).all()
    return [format_role(r, session) for r in roles]


@router.post("", response_model=RoleResponse, status_code=201)
def create_role(
    payload: RoleCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "create"))
):
    name_clean = payload.name.strip()
    existing = session.exec(select(Role).where(Role.name.ilike(name_clean))).first()
    if existing:
        raise HTTPException(status_code=400, detail="A role with this name already exists.")

    new_role = Role(
        name=name_clean,
        description=payload.description or "",
        is_system_role=False
    )
    session.add(new_role)
    session.commit()
    session.refresh(new_role)

    # Add permissions
    passed_perms = {p.module: p for p in (payload.permissions or [])}
    for mod in ALL_MODULES:
        p_dto = passed_perms.get(mod)
        perm = Permission(
            role_id=new_role.id,
            module=mod,
            can_view=p_dto.can_view if p_dto else False,
            can_create=p_dto.can_create if p_dto else False,
            can_edit=p_dto.can_edit if p_dto else False,
            can_delete=p_dto.can_delete if p_dto else False
        )
        session.add(perm)
    
    session.commit()
    return format_role(new_role, session)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: str,
    payload: RoleUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "edit"))
):
    role = session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    if payload.name and payload.name.strip() != role.name:
        if role.is_system_role and role.name == "Super Admin":
            raise HTTPException(status_code=400, detail="The Super Admin role name cannot be renamed.")
        
        name_clean = payload.name.strip()
        existing = session.exec(select(Role).where(Role.name.ilike(name_clean), Role.id != role_id)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another role with this name already exists.")
        role.name = name_clean

    if payload.description is not None:
        role.description = payload.description

    session.add(role)
    session.commit()
    session.refresh(role)

    return format_role(role, session)


@router.put("/{role_id}/permissions", response_model=RoleResponse)
def update_role_permissions(
    role_id: str,
    payload: RolePermissionsUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "edit"))
):
    role = session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    # Update or insert permissions for each module
    existing_perms = session.exec(select(Permission).where(Permission.role_id == role.id)).all()
    perm_map = {p.module: p for p in existing_perms}

    for p_dto in payload.permissions:
        if p_dto.module in perm_map:
            p = perm_map[p_dto.module]
            p.can_view = p_dto.can_view
            p.can_create = p_dto.can_create
            p.can_edit = p_dto.can_edit
            p.can_delete = p_dto.can_delete
            session.add(p)
        else:
            p = Permission(
                role_id=role.id,
                module=p_dto.module,
                can_view=p_dto.can_view,
                can_create=p_dto.can_create,
                can_edit=p_dto.can_edit,
                can_delete=p_dto.can_delete
            )
            session.add(p)

    session.commit()
    return format_role(role, session)


@router.delete("/{role_id}")
def delete_role(
    role_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("settings_users", "delete"))
):
    role = session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System default roles are protected and cannot be deleted."
        )

    # Check if any user is currently assigned to this role
    assigned_users = session.exec(select(User).where(User.role_id == role_id)).all()
    if assigned_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role because {len(assigned_users)} user(s) are currently assigned to it. Please reassign those users first."
        )

    # Delete permissions
    perms = session.exec(select(Permission).where(Permission.role_id == role_id)).all()
    for p in perms:
        session.delete(p)

    session.delete(role)
    session.commit()

    return {"message": f"Role '{role.name}' deleted successfully."}
