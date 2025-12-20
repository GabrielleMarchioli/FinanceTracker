from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth  # Importa o router de auth

app = FastAPI(
    title="FinanceTracker API",
    description="API para gerenciamento de finanças",
    version="1.0.0"
)

# CORS (para o frontend React acessar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "*"],  # Ajuste para produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os routers (sem definir rotas aqui!)
app.include_router(auth.router)

# Endpoint de teste (opcional)
@app.get("/")
def root():
    return {"message": "Bem-vindo à API do FinanceTracker! Acesse /docs para Swagger."}