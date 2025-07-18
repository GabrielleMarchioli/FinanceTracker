import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Transaction } from "./Dashboard";

interface MonthlyChartProps {
  transactions: Transaction[];
  currentDate: Date;
}

export const MonthlyChart = ({ transactions, currentDate }: MonthlyChartProps) => {
  // Get last 6 months of data for bar chart
  const getMonthlyData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === date.getFullYear() && 
               transactionDate.getMonth() === date.getMonth();
      });

      const rendas = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const despesas = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        rendas,
        despesas,
      });
    }
    return data;
  };

  // Get category breakdown for current month
  const getCategoryData = () => {
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentDate.getFullYear() && 
             transactionDate.getMonth() === currentDate.getMonth() &&
             t.type === "expense";
    });

    const categoryTotals: Record<string, number> = {};
    
    currentMonthTransactions.forEach(t => {
      if (categoryTotals[t.category]) {
        categoryTotals[t.category] += t.amount;
      } else {
        categoryTotals[t.category] = t.amount;
      }
    });

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-md p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: R${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border rounded-lg shadow-md p-3">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            R${data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Income vs Expenses Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rendas vs Despesas (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground" 
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="rendas" 
                  fill="hsl(var(--success))" 
                  radius={[2, 2, 0, 0]}
                  name="Rendas"
                />
                <Bar 
                  dataKey="despesas" 
                  fill="hsl(var(--danger))" 
                  radius={[2, 2, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Categorias de Despesas Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.slice(0, 6).map((category) => (
                <div key={category.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.name}</span>
                  <span className="text-muted-foreground text-right w-24">
                    R${category.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};