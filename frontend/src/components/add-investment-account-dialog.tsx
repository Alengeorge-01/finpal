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
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";

interface AddInvestmentAccountDialogProps {
  onSuccess: () => void; // A function to call after an account is added
}

export function AddInvestmentAccountDialog({ onSuccess }: AddInvestmentAccountDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [brokerage, setBrokerage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/investments/', {
        name,
        brokerage,
      });
      setIsDialogOpen(false);
      setName('');
      setBrokerage('');
      onSuccess(); // Notify the parent component to refresh data

      // Trigger a success toast
      toast.success("Investment Created", {
        description: `The "${name}" investment was successfully added.`,
      });
    } catch (error) {
      console.error('Failed to add investment account:', error);

      // Trigger an error toast
      toast.error("Uh oh! Something went wrong.", {
        description: "There was a problem creating your investment.",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Investment Account</DialogTitle>
          <DialogDescription>
            Enter the details for your new brokerage account.
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
                placeholder="e.g., Robinhood IRA"
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
                placeholder="e.g., Robinhood Financial LLC"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}