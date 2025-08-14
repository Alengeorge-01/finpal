'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from "sonner";

interface AddLoanDialogProps {
  onSuccess: () => void;
}

type Disbursement = {
  date: string;
  amount: string;
};

export function AddLoanDialog({ onSuccess }: AddLoanDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [repaymentStartDate, setRepaymentStartDate] = useState<string>('');
  const [disbursements, setDisbursements] = useState<Disbursement[]>([{ date: '', amount: '' }]);

  const handleDisbursementChange = (index: number, field: 'date' | 'amount', value: string) => {
    const newDisbursements = [...disbursements];
    newDisbursements[index][field] = value;
    setDisbursements(newDisbursements);
  };

  const addDisbursement = () => {
    setDisbursements([...disbursements, { date: '', amount: '' }]);
  };

  const removeDisbursement = (index: number) => {
    const newDisbursements = disbursements.filter((_, i) => i !== index);
    setDisbursements(newDisbursements);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const loanResponse = await apiClient.post('/loans/', {
        name,
        interest_rate: interestRate,
        repayment_start_date: repaymentStartDate,
      });
      const loanId = loanResponse.data.id;

      for (const disbursement of disbursements) {
        if (disbursement.date && disbursement.amount) {
          await apiClient.post('/loan-disbursements/', {
            loan: loanId,
            date: disbursement.date,
            amount: disbursement.amount,
          });
        }
      }

      setIsDialogOpen(false);
      setName('');
      setInterestRate('');
      setRepaymentStartDate('');
      setDisbursements([{ date: '', amount: '' }]);
      onSuccess();
      toast.success("Loan Added", { description: `The "${name}" loan has been successfully created.` });
    } catch (error) {
      console.error('Failed to add loan:', error);
      toast.error("Failed to Add Loan");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
          <DialogDescription>Enter the loan details and all disbursement amounts.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Loan Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Student Loan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="e.g., 11.25" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repaymentStartDate">Repayment Start Date</Label>
            <Input id="repaymentStartDate" type="date" value={repaymentStartDate} onChange={(e) => setRepaymentStartDate(e.target.value)} />
          </div>
          
          <hr className="my-4" />

          <div className="space-y-4">
            <Label>Disbursements</Label>
            {disbursements.map((d, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input type="date" value={d.date} onChange={(e) => handleDisbursementChange(index, 'date', e.target.value)} aria-label="Disbursement Date" />
                <Input type="number" value={d.amount} onChange={(e) => handleDisbursementChange(index, 'amount', e.target.value)} placeholder="Amount ($)" aria-label="Disbursement Amount" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDisbursement(index)} disabled={disbursements.length <= 1}>
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addDisbursement} className="w-full">
              Add Another Disbursement
            </Button>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit">Save Loan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}