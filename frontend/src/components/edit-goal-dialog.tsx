'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

type Goal = {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
};

interface EditGoalDialogProps {
  goal: Goal;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditGoalDialog({ goal, onSuccess, children }: EditGoalDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(goal.name);
  const [targetAmount, setTargetAmount] = useState<string>(goal.target_amount);
  const [currentAmount, setCurrentAmount] = useState<string>(goal.current_amount);
  const [targetDate, setTargetDate] = useState<string>(goal.target_date);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/goals/${goal.id}/`, {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
      });
      setIsDialogOpen(false);
      onSuccess();
      toast.success("Goal Updated", { description: `Your goal "${name}" has been updated.` });
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error("Update Failed");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetAmount" className="text-right">Target Amount ($)</Label>
              <Input id="targetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentAmount" className="text-right">Current Amount ($)</Label>
              <Input id="currentAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">Target Date</Label>
              <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="col-span-3" />
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