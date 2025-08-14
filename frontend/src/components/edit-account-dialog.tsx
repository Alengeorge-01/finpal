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
import { toast } from "sonner";

// Define the shape of the account prop
type Account = {
  id: number;
  name: string;
  account_type: string;
  balance: string;
};

interface EditAccountDialogProps {
  account: Account;
  onSuccess: () => void;
  children: React.ReactNode; // To use a component as the trigger
}

export function EditAccountDialog({ account, onSuccess, children }: EditAccountDialogProps) {
  const [accountName, setAccountName] = useState(account.name);
  const [accountType, setAccountType] = useState(account.account_type);
  const [accountBalance, setAccountBalance] = useState(account.balance);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/accounts/${account.id}/`, {
        name: accountName,
        account_type: accountType,
        balance: accountBalance,
      });
      setIsDialogOpen(false);
      onSuccess(); // Refresh the parent component's data
      // Trigger a success toast
      toast.success("Account Created", {
        description: `The "${accountName}" account was successfully edited.`,
      });

    } catch (error) {
      console.error('Failed to edit account:', error);

      // Trigger an error toast
      toast.error("Uh oh! Something went wrong.", {
        description: "There was a problem editing your account.",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update the details for your account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Form fields are pre-populated with the account's current data */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={setAccountType} value={accountType}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
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
              <Input id="balance" type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} className="col-span-3" />
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