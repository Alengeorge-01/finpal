'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions for the AI plan
type PlanStep = {
  step: number;
  title: string;
  description: string;
  completed: boolean;
};

type GoalPlan = {
  goal_title: string;
  target_amount: number;
  target_date: string;
  steps: PlanStep[];
};

export default function AiPlannerPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [plan, setPlan] = useState<GoalPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) {
      toast.warning("Please describe your financial goal.");
      return;
    }
    setLoading(true);
    setPlan(null); // Clear previous plan
    try {
      const response = await apiClient.post('/ai/generate-goal-plan/', { prompt });
      setPlan(response.data);
      toast.success("Your new goal plan has been generated!");
    } catch (error) {
      console.error("Failed to generate plan:", error);
      toast.error("Failed to Generate Plan", {
        description: "There was a problem communicating with the AI service."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary">AI Financial Goal Planner</h1>
        <p className="mt-2 text-slate-500">Describe your goal, and let our AI create a step-by-step plan for you.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'I want to save $50,000 for a house down payment in the next 3 years.'"
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={loading} className="w-full md:w-auto md:self-end">
              {loading ? "Generating Plan..." : "Generate Plan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mt-8">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4"><Skeleton className="h-6 w-6 rounded" /><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-64" /></div></div>
            <div className="flex items-start space-x-4"><Skeleton className="h-6 w-6 rounded" /><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-64" /></div></div>
            <div className="flex items-start space-x-4"><Skeleton className="h-6 w-6 rounded" /><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-64" /></div></div>
          </CardContent>
        </Card>
      )}

      {plan && !loading && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{plan.goal_title}</CardTitle>
            <CardDescription>
              Target: {plan.target_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} by {new Date(plan.target_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {plan.steps.map((step) => (
                <li key={step.step} className="flex items-start space-x-4">
                  <Checkbox id={`step-${step.step}`} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor={`step-${step.step}`} className="font-semibold">{step.title}</label>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}