from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    if credentials.email.lower() == "usmaniatrust@gmail.com" and credentials.password == "Usmania@1994":
        return LoginResponse(
            access_token="jut_secure_session_token_2026",
            token_type="bearer",
            user={
                "email": "usmaniatrust@gmail.com",
                "name": "Jamia Usmania Administration",
                "role": "Super Admin"
            }
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect Email or Password. Please check your credentials."
    )
