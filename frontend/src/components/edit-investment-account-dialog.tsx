'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type InvestmentAccount = {
  id: number;
  name: string;
  brokerage: string;
};

interface EditInvestmentAccountDialogProps {
  account: InvestmentAccount;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditInvestmentAccountDialog({ account, onSuccess, children }: EditInvestmentAccountDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(account.name);
  const [brokerage, setBrokerage] = useState<string>(account.brokerage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/investments/${account.id}/`, {
        name,
        brokerage,
      });
      setIsDialogOpen(false);
      onSuccess(); // Refresh the parent component's data
      toast.success('Investment account updated successfully!', {
        description: `The "${name}" account was successfully edited.`,
      });
    } catch (error) {
      console.error('Failed to update investment account:', error);
      toast.error('Failed to update investment account', {
        description: 'There was an error updating the account. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Investment Account</DialogTitle>
          <DialogDescription>
            Update the details for your brokerage account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Account Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brokerage" className="text-right">
                Brokerage
              </Label>
              <Input
                id="brokerage"
                value={brokerage}
                onChange={(e) => setBrokerage(e.target.value)}
                className="col-span-3"
              />
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