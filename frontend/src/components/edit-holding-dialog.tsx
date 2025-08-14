'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Type definitions
type Holding = {
  id: number;
  symbol: string;
  shares: string;
  cost_basis: string;
};

interface EditHoldingDialogProps {
  holding: Holding;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditHoldingDialog({ holding, onSuccess, children }: EditHoldingDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Pre-fill form state with the holding's existing data
  const [symbol, setSymbol] = useState<string>(holding.symbol);
  const [shares, setShares] = useState<string>(holding.shares);
  const [costBasis, setCostBasis] = useState<string>(holding.cost_basis);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/holdings/${holding.id}/`, {
        symbol: symbol.toUpperCase(),
        shares,
        cost_basis: costBasis,
      });
      setIsDialogOpen(false);
      onSuccess(); // Refresh the parent component's data
      toast.success('Holding updated successfully!', {
        description: `The holding for symbol "${symbol}" has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update holding:', error);
      toast.error('Failed to update holding', {
        description: 'There was an error updating the holding. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">Symbol</Label>
              <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shares" className="text-right">Shares</Label>
              <Input id="shares" type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost-basis" className="text-right">Total Cost ($)</Label>
              <Input id="cost-basis" type="number" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} className="col-span-3" />
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