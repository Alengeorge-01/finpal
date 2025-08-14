'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";

// Type definition for a single day in our forecast
type ForecastDataPoint = {
  date: string;
  balance: number;
};

export default function CashFlowForecastChart() {
  const [data, setData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchForecastData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/cash-flow-forecast/');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch cash flow forecast:', error);
      toast.error("Could not load cash flow forecast.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecastData();
  }, [fetchForecastData]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Cash Flow Forecast</CardTitle>
        <CardDescription>
          A projection of your cash balance based on recurring income and bills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12}
              tickFormatter={(str) => format(parseISO(str), 'MMM d')}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
            />
            {/* This line indicates the zero-balance mark */}
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="balance" stroke="#386BF6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}