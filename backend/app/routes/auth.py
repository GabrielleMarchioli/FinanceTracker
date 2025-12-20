# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import Dict, Any
from ..config.database import supabase, supabase_admin  # Importe ambos!
from ..schemas.user import RegisterData, LoginData, UserOut

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={401: {"description": "Credenciais inválidas"}}
)

security = HTTPBearer()

@router.post("/register")
async def register(data: RegisterData):
    """
    Registra um novo usuário com email, username e senha.
    - Verifica se username já existe
    - Verifica se email já está cadastrado (bloqueia duplicados)
    - Cria usuário no Supabase Auth
    - O trigger no Supabase cria o registro na tabela users automaticamente
    """
    print(f"[LOG] Recebido request para register: email={data.email}, username={data.username}")

    # Verifica username duplicado
    existing_username = supabase.table("users").select("username").eq("username", data.username).execute()
    if existing_username.data:
        print("[LOG] Username já existe:", data.username)
        raise HTTPException(status_code=409, detail="Username já em uso")

    # Verifica email duplicado usando admin (service_role key)
    try:
        print("[LOG] Checando emails existentes...")
        if supabase_admin is None:
            print("[LOG] ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada")
            raise HTTPException(status_code=500, detail="Servidor não configurado para checar emails")
        users_list = supabase_admin.auth.admin.list_users()  # Retorna lista diretamente
        for user in users_list:  # Itera na lista
            if user.email == data.email:
                print("[LOG] Email já cadastrado:", data.email)
                raise HTTPException(status_code=500, detail="Email já cadastrado. Use outro email ou faça login.")
    except Exception as e:
        print("[LOG] Erro ao checar emails:", str(e))
        raise HTTPException(status_code=409, detail="Use outro email ou faça login.")

    try:
        print("[LOG] Iniciando sign_up no Supabase...")
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {"username": data.username}
            }
        })
        print("[LOG] Resposta do sign_up:", auth_response)

        if not auth_response.user:
            print("[LOG] Erro: Nenhum user retornado no sign_up")
            raise HTTPException(status_code=400, detail="Erro ao registrar usuário no Supabase")

        print("[LOG] Usuário criado com sucesso no auth.users. ID:", auth_response.user.id)

        # O trigger no Supabase cuida da tabela users automaticamente!
        print("[LOG] Registro concluído com sucesso! (Trigger cuida da tabela users)")

        return {
            "message": "Registro realizado com sucesso!",
            "user": UserOut(
                id=auth_response.user.id,
                email=auth_response.user.email,
                username=data.username,
                created_at=auth_response.user.created_at
            )
        }
    except Exception as e:
        error_msg = str(e)
        print("[LOG] Erro geral no register:", error_msg)
        if "User already registered" in error_msg:
            raise HTTPException(status_code=409, detail="Email já cadastrado. Use outro email ou faça login.")
        raise HTTPException(status_code=400, detail=error_msg)

@router.post("/login")
async def login(data: LoginData):
    print(f"[LOG] Recebido request para login: email={data.email}")
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        print("[LOG] Resposta do login:", auth_response)

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        profile = supabase.table("users").select("username").eq("id", auth_response.user.id).execute()
        username = profile.data[0]["username"] if profile.data else data.email.split("@")[0]

        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": UserOut(
                id=auth_response.user.id,
                email=auth_response.user.email,
                username=username,
                created_at=auth_response.user.created_at
            )
        }
    except Exception as e:
        print("[LOG] Erro no login:", str(e))
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me", dependencies=[Depends(security)])
async def get_current_user():
    try:
        token = await security()
        user = supabase.auth.get_user(token.credentials)
        if not user.user:
            raise HTTPException(status_code=401, detail="Sessão inválida")

        profile = supabase.table("users").select("username").eq("id", user.user.id).execute()
        username = profile.data[0]["username"] if profile.data else None

        return {
            "user": UserOut(
                id=user.user.id,
                email=user.user.email,
                username=username,
                created_at=user.user.created_at
            )
        }
    except Exception as e:
        print("[LOG] Erro no /me:", str(e))
        raise HTTPException(status_code=401, detail=str(e))