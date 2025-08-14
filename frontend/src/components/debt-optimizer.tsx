'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";

// Type definitions
type PayoffResult = {
  months_to_payoff: number;
  total_interest_paid: number;
};

type OptimizerResult = {
  avalanche: PayoffResult;
  snowball: PayoffResult;
};

export default function DebtOptimizer() {
  const [extraPayment, setExtraPayment] = useState<string>('100');
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await apiClient.get(`/debt-optimizer/?extra_payment=${extraPayment}`);
      setResult(response.data);
    } catch (error) {
      console.error("Failed to calculate debt optimization:", error);
      toast.error("Calculation Failed", {
        description: "There was a problem running the simulation."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Repayment Optimizer</CardTitle>
        <CardDescription>
          See how an extra monthly payment can accelerate your debt payoff using different strategies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="grid w-full sm:w-auto flex-grow gap-1.5">
            <Label htmlFor="extra-payment">Extra Monthly Payment ($)</Label>
            <Input
              type="number"
              id="extra-payment"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="e.g., 100"
            />
          </div>
          <Button onClick={handleCalculate} disabled={loading}>
            {loading ? "Calculating..." : "Calculate Payoff"}
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avalanche Method</CardTitle>
                <CardDescription>Pays off highest interest rate first. (Saves the most money)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{result.avalanche.months_to_payoff} months to be debt-free</p>
                <p className="text-red-600">
                  Total Interest Paid: {Number(result.avalanche.total_interest_paid).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Snowball Method</CardTitle>
                <CardDescription>Pays off smallest balance first. (For quick wins)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{result.snowball.months_to_payoff} months to be debt-free</p>
                <p className="text-red-600">
                  Total Interest Paid: {Number(result.snowball.total_interest_paid).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}