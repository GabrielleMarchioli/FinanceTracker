import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";
import { MonthlyChart } from "./components/MonthlyChart";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";

// Tipo Transaction ajustado para corresponder aos componentes
type Transaction = {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  date: string; // Mantido como string para TransactionList
  isInstallment?: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  relatedInstallmentId?: string;
};

const queryClient = new QueryClient();

const App = () => {
  // Placeholder para onLogin (AuthForm)
  const handleLogin = (username: string) => {
    console.log("Login com usuário:", username);
  };

  // Placeholder para onLogout (Dashboard)
  const handleLogout = () => {
    console.log("Usuário deslogado");
  };

  // Placeholder para transactions (MonthlyChart e TransactionList)
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      amount: 100,
      description: "Compra teste",
      category: "Alimentação",
      date: new Date().toISOString(), // Mantido como string ISO
    },
  ];

  // Placeholder para onAdd (TransactionForm), ajustado para Omit<Transaction, "id">
  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    console.log("Transação adicionada:", transaction);
  };

  // Placeholder para onClose (TransactionForm)
  const handleClose = () => {
    console.log("Formulário fechado");
  };

  // Placeholder para onDelete (TransactionList)
  const handleDelete = (id: string) => {
    console.log("Transação deletada:", id);
  };

  // Placeholder para currentDate e defaultDate, ajustado para Date
  const currentDate = new Date(); // Corrigido para objeto Date

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthForm onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={<Dashboard username="Usuário Teste" onLogout={handleLogout} />}
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;