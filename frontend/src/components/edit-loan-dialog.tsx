'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

// Corrected Type definition for the Loan prop
type Loan = {
  id: number;
  name: string;
  slug: string;
  interest_rate: string;
  repayment_start_date: string;
};

interface EditLoanDialogProps {
  loan: Loan;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditLoanDialog({ loan, onSuccess, children }: EditLoanDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Pre-fill form state with the loan's existing data
  const [name, setName] = useState<string>(loan.name);
  const [interestRate, setInterestRate] = useState<string>(loan.interest_rate);
  const [repaymentStartDate, setRepaymentStartDate] = useState<string>(loan.repayment_start_date);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/loans/${loan.id}/`, {
        name,
        interest_rate: interestRate,
        repayment_start_date: repaymentStartDate,
      });
      setIsDialogOpen(false);
      onSuccess();
      toast.success("Loan Updated", { description: `The "${name}" loan has been successfully updated.` });
    } catch (error) {
      console.error('Failed to update loan:', error);
      toast.error("Update Failed", { description: "There was a problem saving your changes." });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">Interest Rate (%)</Label>
              <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repaymentStartDate" className="text-right">Repayment Start</Label>
              <Input id="repaymentStartDate" type="date" value={repaymentStartDate} onChange={(e) => setRepaymentStartDate(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}