from sqlmodel import SQLModel, create_engine, Session, text
from app.config import settings

db_url = settings.DATABASE_URL
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

def init_db():
    SQLModel.metadata.create_all(engine)
    
    # Auto-migration for added columns in existing PostgreSQL/SQLite tables
    with Session(engine) as session:
        try:
            if "sqlite" in db_url:
                # SQLite column check / add
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
                    "ALTER TABLE loan ADD COLUMN received_in_account VARCHAR DEFAULT 'Cash';"
                ]:
                    try:
                        session.exec(text(col_stmt))
                    except Exception:
                        pass
            else:
                # Postgres ALTER TABLE IF NOT EXISTS
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
            session.commit()
        except Exception:
            session.rollback()

def get_session():
    with Session(engine) as session:
        yield session
