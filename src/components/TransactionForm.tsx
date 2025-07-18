import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, CreditCard } from "lucide-react";
import { Transaction } from "./Dashboard";

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  onClose: () => void;
  defaultDate: Date;
}

const categories = {
  income: ["Salary", "Freelance", "Investment", "Bonus", "Other Income"],
  expense: ["Food", "Transportation", "Housing", "Entertainment", "Healthcare", "Shopping", "Utilities", "Other"]
};

export const TransactionForm = ({ onAdd, onClose, defaultDate }: TransactionFormProps) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(defaultDate.toISOString().split('T')[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState("12");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      return;
    }

    const transaction: Omit<Transaction, "id"> = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      isInstallment,
      installmentInfo: isInstallment ? {
        current: 1,
        total: parseInt(installmentCount),
        originalAmount: parseFloat(amount),
        originalDate: date,
      } : undefined,
    };

    onAdd(transaction);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "income" ? "success" : "outline"}
              onClick={() => setType("income")}
              className="w-full"
            >
              Income
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "danger" : "outline"}
              onClick={() => setType("expense")}
              className="w-full"
            >
              Expense
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Installment Option (for expenses only) */}
          {type === "expense" && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <Label htmlFor="installment">Installment Payment</Label>
                </div>
                <Switch
                  id="installment"
                  checked={isInstallment}
                  onCheckedChange={setIsInstallment}
                />
              </div>
              
              {isInstallment && (
                <div className="space-y-2">
                  <Label htmlFor="installmentCount">Number of Installments</Label>
                  <Select value={installmentCount} onValueChange={setInstallmentCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 6, 12, 18, 24, 36].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} months
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Each installment: ${amount ? (parseFloat(amount) / parseInt(installmentCount)).toFixed(2) : '0.00'}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};