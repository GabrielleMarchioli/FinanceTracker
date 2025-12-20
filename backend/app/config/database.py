import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional, Dict, Any

load_dotenv()  # Carrega .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Para admin (list_users, etc.)

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_URL e SUPABASE_ANON_KEY não encontrados no .env")

# Cliente padrão (anon key) para operações públicas
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Cliente admin (service_role key) para operações privilegiadas (ex: list_users)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_SERVICE_ROLE_KEY else None

def signup_user(email: str, password: str) -> Dict[str, Any]:
    """
    Registra um novo usuário com email e senha.
    Retorna o user e session se sucesso.
    """
    try:
        data = supabase.auth.sign_up({"email": email, "password": password})
        if data.user:
            return {
                "success": True,
                "user": data.user,
                "session": data.session,
                "message": "Usuário registrado com sucesso!"
            }
        else:
            return {"success": False, "message": "Erro ao registrar (verifique se o email já existe)"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def login_user(email: str, password: str) -> Dict[str, Any]:
    """
    Faz login com email e senha.
    Retorna o user e session se sucesso.
    """
    try:
        data = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if data.user:
            return {
                "success": True,
                "user": data.user,
                "session": data.session,
                "message": "Login realizado com sucesso!"
            }
        else:
            return {"success": False, "message": "Credenciais inválidas"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_current_user() -> Dict[str, Any]:
    """
    Pega o usuário atual logado (baseado na session).
    """
    try:
        data = supabase.auth.get_user()
        if data.user:
            return {
                "success": True,
                "user": data.user,
                "message": "Usuário atual recuperado"
            }
        else:
            return {"success": False, "message": "Nenhum usuário logado"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def logout():
    """
    Desloga o usuário atual.
    """
    try:
        supabase.auth.sign_out()
        return {"success": True, "message": "Logout realizado"}
    except Exception as e:
        return {"success": False, "message": str(e)}