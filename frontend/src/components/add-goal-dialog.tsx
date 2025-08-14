'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";

interface AddGoalDialogProps {
  onSuccess: () => void;
}

export function AddGoalDialog({ onSuccess }: AddGoalDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post('/goals/', {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
      });
      setIsDialogOpen(false);
      // Reset form
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      onSuccess();
      toast.success("Goal Created", { description: `Your goal "${name}" has been added.` });
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast.error("Failed to Add Goal");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Savings Goal</DialogTitle>
          <DialogDescription>Describe your goal and track your progress.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Vacation Fund" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetAmount" className="text-right">Target Amount ($)</Label>
              <Input id="targetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="col-span-3" placeholder="e.g., 2000" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentAmount" className="text-right">Current Amount ($)</Label>
              <Input id="currentAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="col-span-3" placeholder="e.g., 500" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">Target Date</Label>
              <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}