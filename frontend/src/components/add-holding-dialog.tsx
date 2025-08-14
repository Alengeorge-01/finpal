'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from "sonner";

interface AddHoldingDialogProps {
  investmentAccountId: number;
  onSuccess: () => void;
}

export function AddHoldingDialog({ investmentAccountId, onSuccess }: AddHoldingDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<string>('');
  const [shares, setShares] = useState<string>('');
  const [costBasis, setCostBasis] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/holdings/', {
        symbol: symbol.toUpperCase(),
        shares,
        cost_basis: costBasis,
        investment_account: investmentAccountId,
      });
      setIsDialogOpen(false);
      setSymbol('');
      setShares('');
      setCostBasis('');
      onSuccess();

      // Trigger a success toast
      toast.success("Holding Created", {
        description: `The "${symbol}" holding was successfully added.`,
      });
    } catch (error) {
      console.error('Failed to add holding:', error);
      // Trigger an error toast
      toast.error("Uh oh! Something went wrong.", {
        description: "There was a problem creating your holding.",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Holding</DialogTitle>
          <DialogDescription>
            Enter the details for a stock or asset in this account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">Symbol</Label>
              <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="col-span-3" placeholder="e.g., AAPL, VOO" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shares" className="text-right">Shares</Label>
              <Input id="shares" type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="col-span-3" placeholder="e.g., 10.5" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost-basis" className="text-right">Total Cost ($)</Label>
              <Input id="cost-basis" type="number" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} className="col-span-3" placeholder="e.g., 1500.00" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Holding</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}