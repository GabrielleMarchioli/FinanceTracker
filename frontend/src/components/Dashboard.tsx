import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Calendar,
  LogOut,
  PieChart
} from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { MonthlyChart } from "./MonthlyChart";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  isInstallment?: boolean;
  installmentInfo?: {
    current: number;
    total: number;
    originalAmount: number;
    originalDate: string;
  };
}

export const Dashboard = ({ username, onLogout }: { username: string; onLogout: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(5000); // Default budget

  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const currentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getFullYear() === currentDate.getFullYear() && 
           transactionDate.getMonth() === currentDate.getMonth();
  });

  const totalIncome = currentTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = totalIncome - totalExpenses;
  const budgetUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    // Handle installment payments
    if (transaction.isInstallment && transaction.installmentInfo) {
      const installmentTransactions: Transaction[] = [];
      const startDate = new Date(transaction.date);
      
      for (let i = 0; i < transaction.installmentInfo.total; i++) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(startDate.getMonth() + i);
        
        installmentTransactions.push({
          ...newTransaction,
          id: `${Date.now()}-${i}`,
          date: installmentDate.toISOString().split('T')[0],
          installmentInfo: {
            ...transaction.installmentInfo,
            current: i + 1,
          },
        });
      }
      
      setTransactions(prev => [...prev, ...installmentTransactions]);
    } else {
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    setShowTransactionForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem(`transactions-${username}`);
    const savedBudget = localStorage.getItem(`budget-${username}`);
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget));
    }
  }, [username]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(`transactions-${username}`, JSON.stringify(transactions));
  }, [transactions, username]);

  useEffect(() => {
    localStorage.setItem(`budget-${username}`, monthlyBudget.toString());
  }, [monthlyBudget, username]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getFullYear() === now.getFullYear() && 
           currentDate.getMonth() === now.getMonth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FinanceTracker</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo(a), {username}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{formatMonth(currentDate)}</h2>
              {isCurrentMonth() && (
                <Badge variant="secondary">Current</Badge>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="gradient" onClick={() => setShowTransactionForm(true)}>
            <Plus className="h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renda Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R${totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
              <TrendingDown className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">R${totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sobra</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                R${Math.abs(remaining).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <MonthlyChart transactions={transactions} currentDate={currentDate} />
          
          {/* Transactions List */}
          <TransactionList 
            transactions={currentTransactions} 
            onDelete={deleteTransaction}
          />
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          onAdd={addTransaction}
          onClose={() => setShowTransactionForm(false)}
          defaultDate={currentDate}
        />
      )}
    </div>
  );
};