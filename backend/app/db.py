from sqlmodel import SQLModel, create_engine, Session, text
from app.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)
    
    # Auto-migration for added columns in existing PostgreSQL/SQLite tables
    with Session(engine) as session:
        try:
            if "sqlite" in db_url:
                # SQLite column check / add
                try:
                    session.exec(text("ALTER TABLE student ADD COLUMN assigned_teacher_id VARCHAR;"))
                except Exception:
                    pass
                try:
                    session.exec(text("ALTER TABLE student ADD COLUMN assigned_teacher_name VARCHAR DEFAULT '';"))
                except Exception:
                    pass
            else:
                # Postgres ALTER TABLE IF NOT EXISTS
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS assigned_teacher_id VARCHAR;"))
                session.exec(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS assigned_teacher_name VARCHAR DEFAULT '';"))
            session.commit()
        except Exception:
            session.rollback()

def get_session():
    with Session(engine) as session:
        yield session
