'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from "sonner";

interface AddLoanPaymentDialogProps {
  loanId: number;
  onSuccess: () => void;
}

export function AddLoanPaymentDialog({ loanId, onSuccess }: AddLoanPaymentDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/loan-payments/', {
        loan: loanId,
        amount,
        date,
      });
      setIsDialogOpen(false);
      setAmount('');
      setDate('');
      onSuccess();
      toast.success("Payment Added", { description: "The payment has been successfully recorded." });
    } catch (error) {
      console.error('Failed to add payment:', error);
      toast.error("Failed to Add Payment");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Loan Payment</DialogTitle>
          <DialogDescription>Record a new payment made towards this loan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount ($)</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Payment Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}