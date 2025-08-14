'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { AddGoalDialog } from '@/components/add-goal-dialog';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { toast } from "sonner";

type Goal = {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(() => {
    setLoading(true);
    apiClient.get('/goals/')
      .then(res => setGoals(res.data.results || res.data))
      .catch(error => console.error('Failed to fetch goals:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (goalId: number) => {
    setGoals(currentGoals => currentGoals.filter(g => g.id !== goalId));
    try {
      await apiClient.delete(`/goals/${goalId}/`);
      toast.success("Goal Deleted");
    } catch (error) {
      toast.error("Delete Failed");
      fetchGoals();
    }
  };

  if (loading) return <div>Loading goals...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Savings Goals</h1>
          <p className="mt-2 text-slate-500">Track your progress towards your financial goals.</p>
        </div>
        <AddGoalDialog onSuccess={fetchGoals} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {goals.map(goal => {
          const target = parseFloat(goal.target_amount);
          const current = parseFloat(goal.current_amount);
          const progress = target > 0 ? (current / target) * 100 : 0;

          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{goal.name}</span>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditGoalDialog goal={goal} onSuccess={fetchGoals}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                        </EditGoalDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this savings goal.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(goal.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
                <CardDescription>
                  Target: {target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} by {format(parseISO(goal.target_date), 'dd MMM, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 mb-2">
                  {current.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} saved
                </div>
                <Progress value={progress} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}