'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Type definition for a single snapshot from our API
type NetWorthSnapshot = {
  date: string;
  total_assets: string;
  total_liabilities: string;
  net_worth: string;
};

export default function NetWorthChart() {
  const [data, setData] = useState<NetWorthSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNetWorthData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/net-worth/');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch net worth data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetWorthData();
  }, [fetchNetWorthData]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
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
        <CardTitle>Net Worth Over Time</CardTitle>
        <CardDescription>
          A historical view of your financial growth (Assets - Liabilities).
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
              tickFormatter={(str) => format(parseISO(str), 'MMM yyyy')}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
            />
            <Legend />
            <Line type="monotone" dataKey="net_worth" stroke="#386BF6" strokeWidth={2} name="Net Worth" dot={false} />
            <Line type="monotone" dataKey="total_assets" stroke="#22c55e" strokeWidth={2} name="Assets" dot={false} />
            <Line type="monotone" dataKey="total_liabilities" stroke="#ef4444" strokeWidth={2} name="Liabilities" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}