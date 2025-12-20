import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import { MonthlyChart } from "./components/MonthlyChart";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { supabase } from "@/lib/supabase"; // Cliente Supabase

// Tipo Transaction (mantido igual)
type Transaction = {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  date: string;
  isInstallment?: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  relatedInstallmentId?: string;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const [username, setUsername] = useState<string | null>(null); // Agora só username
  const navigate = useNavigate();

  const handleLogin = (userUsername: string) => {
    setUsername(userUsername);
    console.log("Usuário logado:", userUsername);
    navigate("/dashboard"); // Redireciona para dashboard
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Logout real no Supabase
      setUsername(null);
      console.log("Usuário deslogado");
      navigate("/auth"); // Redireciona para login
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  // Mock transactions
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      amount: 100,
      description: "Compra teste",
      category: "Alimentação",
      date: new Date().toISOString(),
    },
  ];

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    console.log("Transação adicionada:", transaction);
  };

  const handleClose = () => {
    console.log("Formulário fechado");
  };

  const handleDelete = (id: string) => {
    console.log("Transação deletada:", id);
  };

  const currentDate = new Date();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthForm onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                username={username || "Usuário Teste"}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/chart"
            element={<MonthlyChart transactions={mockTransactions} currentDate={currentDate} />}
          />
          <Route
            path="/transaction-form"
            element={
              <TransactionForm
                onAdd={handleAddTransaction}
                onClose={handleClose}
                defaultDate={currentDate}
              />
            }
          />
          <Route
            path="/transactions"
            element={<TransactionList transactions={mockTransactions} onDelete={handleDelete} />}
          />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;