import os
from sqlmodel import SQLModel, create_engine, Session, select, text
from app.config import settings
from app.models import (
    Role, Permission, User, ALL_MODULES, ModuleEnum
)
from app.services.auth_service import hash_password

db_url = settings.DATABASE_URL or os.getenv("DATABASE_URL", "sqlite:///./jamia_usmania.db")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {"echo": False}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
else:
    # Production PostgreSQL (Neon Serverless) settings
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(db_url, **engine_kwargs)

def seed_default_roles_and_admin(session: Session):
    """Seeds the 5 default system roles and the initial Super Admin account."""
    
    # 1. Define Default Roles Specification
    default_roles_spec = [
        {
            "name": "Super Admin",
            "description": "Full administrative access to all modules, finance sections, and user management.",
            "is_system_role": True,
            "permissions": {
                m: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True}
                for m in ALL_MODULES
            }
        },
        {
            "name": "Academic Manager",
            "description": "Full access to Students, Teachers, and Staff modules.",
            "is_system_role": True,
            "permissions": {
                ModuleEnum.STUDENTS.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.TEACHERS.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.STAFF.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
            }
        },
        {
            "name": "Finance Manager",
            "description": "Full access to all Finance sections (Dashboard, Received, Debit, Kind Donation, Loan, Liabilities).",
            "is_system_role": True,
            "permissions": {
                ModuleEnum.FINANCE_DASHBOARD.value: {"can_view": True, "can_create": False, "can_edit": False, "can_delete": False},
                ModuleEnum.FINANCE_RECEIVED.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.FINANCE_DEBIT.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.FINANCE_KIND_DONATION.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.FINANCE_LOAN.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                ModuleEnum.FINANCE_LIABILITY.value: {"can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
            }
        },
        {
            "name": "Staff (Front Desk)",
            "description": "View and Create access for Admissions, Faculty, Staff, and Receiving Donations (no edit/delete rights).",
            "is_system_role": True,
            "permissions": {
                ModuleEnum.STUDENTS.value: {"can_view": True, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.TEACHERS.value: {"can_view": True, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.STAFF.value: {"can_view": True, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.FINANCE_RECEIVED.value: {"can_view": True, "can_create": True, "can_edit": False, "can_delete": False},
            }
        },
        {
            "name": "Data Entry Operator",
            "description": "Create-only access for Receiving, Debit, Kind Donation, and Liabilities forms (no view or history access).",
            "is_system_role": True,
            "permissions": {
                ModuleEnum.FINANCE_RECEIVED.value: {"can_view": False, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.FINANCE_DEBIT.value: {"can_view": False, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.FINANCE_KIND_DONATION.value: {"can_view": False, "can_create": True, "can_edit": False, "can_delete": False},
                ModuleEnum.FINANCE_LIABILITY.value: {"can_view": False, "can_create": True, "can_edit": False, "can_delete": False},
            }
        }
    ]

    super_admin_role_id = None

    for role_spec in default_roles_spec:
        role = session.exec(select(Role).where(Role.name == role_spec["name"])).first()
        if not role:
            role = Role(
                name=role_spec["name"],
                description=role_spec["description"],
                is_system_role=role_spec["is_system_role"]
            )
            session.add(role)
            session.commit()
            session.refresh(role)
            print(f"[RBAC Seeder] Created default role: {role.name}")

            # Create permissions for all modules
            for mod in ALL_MODULES:
                mod_perm = role_spec["permissions"].get(mod, {
                    "can_view": False, "can_create": False, "can_edit": False, "can_delete": False
                })
                perm = Permission(
                    role_id=role.id,
                    module=mod,
                    can_view=mod_perm["can_view"],
                    can_create=mod_perm["can_create"],
                    can_edit=mod_perm["can_edit"],
                    can_delete=mod_perm["can_delete"]
                )
                session.add(perm)
            session.commit()
        else:
            # Ensure all 8 modules have a permission record for this role
            existing_perms = session.exec(select(Permission).where(Permission.role_id == role.id)).all()
            existing_modules = {p.module for p in existing_perms}
            for mod in ALL_MODULES:
                if mod not in existing_modules:
                    mod_perm = role_spec["permissions"].get(mod, {
                        "can_view": False, "can_create": False, "can_edit": False, "can_delete": False
                    })
                    perm = Permission(
                        role_id=role.id,
                        module=mod,
                        can_view=mod_perm["can_view"],
                        can_create=mod_perm["can_create"],
                        can_edit=mod_perm["can_edit"],
                        can_delete=mod_perm["can_delete"]
                    )
                    session.add(perm)
            session.commit()

        if role.name == "Super Admin":
            super_admin_role_id = role.id

    # 2. Seed Initial Super Admin User if not exists
    admin_email = settings.INITIAL_ADMIN_EMAIL.lower().strip()
    admin_user = session.exec(select(User).where(User.email == admin_email)).first()
    if not admin_user:
        hashed_pwd = hash_password(settings.INITIAL_ADMIN_PASSWORD)
        admin_user = User(
            name=settings.INITIAL_ADMIN_NAME,
            email=admin_email,
            password_hash=hashed_pwd,
            role_id=super_admin_role_id,
            is_active=True,
            token_version=1
        )
        session.add(admin_user)
        session.commit()
        print(f"[RBAC Seeder] Created initial Super Admin user: {admin_email}")
    else:
        # Ensure Super Admin has super admin role
        if super_admin_role_id and admin_user.role_id != super_admin_role_id:
            admin_user.role_id = super_admin_role_id
            session.add(admin_user)
            session.commit()


def init_db():
    SQLModel.metadata.create_all(engine)
    
    # Auto-migration for added columns in existing PostgreSQL/SQLite tables
    with Session(engine) as session:
        try:
            if "sqlite" in db_url:
                for col_stmt in [
                    "ALTER TABLE student ADD COLUMN assigned_teacher_id VARCHAR;",
                    "ALTER TABLE student ADD COLUMN assigned_teacher_name VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN is_zakat_eligible BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE student ADD COLUMN is_academy_student BOOLEAN DEFAULT FALSE;",
                    "ALTER TABLE student ADD COLUMN hostel_room_no VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN hostel_bed_no VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN zakat_syed_status VARCHAR DEFAULT 'Non-Syed';",
                    "ALTER TABLE student ADD COLUMN academy_class VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN father_name VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN guardian_name VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN guardian_contact VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN doc_zakat VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN doc_birth_certificate VARCHAR DEFAULT '';",
                    "ALTER TABLE student ADD COLUMN doc_activity_diary VARCHAR DEFAULT '';",
                    "ALTER TABLE teacher ADD COLUMN doc_contract VARCHAR DEFAULT '';",
                    "ALTER TABLE teacher ADD COLUMN doc_payslip VARCHAR DEFAULT '';",
                    "ALTER TABLE teacher ADD COLUMN doc_cnic VARCHAR DEFAULT '';",
                    "ALTER TABLE loan ADD COLUMN received_in_account VARCHAR DEFAULT 'Cash';",
                    "ALTER TABLE user ADD COLUMN token_version INTEGER DEFAULT 1;"
                ]:
                    try:
                        session.exec(text(col_stmt))
                    except Exception:
                        pass
            else:
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS assigned_teacher_id VARCHAR;"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS assigned_teacher_name VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS is_zakat_eligible BOOLEAN DEFAULT FALSE;"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS is_academy_student BOOLEAN DEFAULT FALSE;"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS hostel_room_no VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS hostel_bed_no VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS zakat_syed_status VARCHAR DEFAULT 'Non-Syed';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS academy_class VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS father_name VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS guardian_name VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS guardian_contact VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS doc_zakat VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS doc_birth_certificate VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS doc_activity_diary VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE teacher ADD COLUMN IF NOT EXISTS doc_contract VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE teacher ADD COLUMN IF NOT EXISTS doc_payslip VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE teacher ADD COLUMN IF NOT EXISTS doc_cnic VARCHAR DEFAULT '';"))
                session.exec(text("ALTER TABLE loan ADD COLUMN IF NOT EXISTS received_in_account VARCHAR DEFAULT 'Cash';"))
                session.exec(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;"))
            session.commit()
        except Exception as e:
            session.rollback()

        # Seed roles & super admin
        try:
            seed_default_roles_and_admin(session)
        except Exception as e:
            print("[RBAC] Seeding error:", e)
            session.rollback()

def get_session():
    with Session(engine) as session:
        yield session
