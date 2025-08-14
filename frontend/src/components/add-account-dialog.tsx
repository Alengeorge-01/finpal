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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";

interface AddAccountDialogProps {
  onSuccess: () => void;
}

export function AddAccountDialog({ onSuccess }: AddAccountDialogProps) {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/accounts/create/', {
        name: accountName,
        account_type: accountType,
        balance: accountBalance,
      });

      setIsDialogOpen(false);
      setAccountName('');
      setAccountType('');
      setAccountBalance('');
      onSuccess();

      // Trigger a success toast
      toast.success("Account Created", {
        description: `The "${accountName}" account was successfully added.`,
      });

    } catch (error) {
      console.error('Failed to add account:', error);

      // Trigger an error toast
      toast.error("Uh oh! Something went wrong.", {
        description: "There was a problem creating your account.",
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
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Enter the details for your new account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="col-span-3" placeholder="e.g., Chase Checking" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={setAccountType} value={accountType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CREDIT">Credit Card</SelectItem>
                  <SelectItem value="INVESTMENT">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Balance</Label>
              <Input id="balance" type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} className="col-span-3" placeholder="e.g., 1250.75" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}