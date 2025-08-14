'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { toast } from "sonner";

// Type definition for an upcoming bill
type UpcomingBill = {
  id: number;
  name: string;
  predicted_date: string;
  estimated_amount: string;
};

export default function UpcomingBills() {
  const [bills, setBills] = useState<UpcomingBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUpcomingBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/upcoming-bills/');
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch upcoming bills:', error);
      toast.error("Could not load upcoming bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingBills();
  }, [fetchUpcomingBills]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills & Subscriptions</CardTitle>
        <CardDescription>
          Predicted payments due in the near future.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {bills.slice(0, 5).map((bill) => ( // Show top 5 upcoming
            <li key={bill.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{bill.name}</p>
                <p className="text-sm text-slate-500">
                  Due: {format(parseISO(bill.predicted_date), 'dd MMM, yyyy')}
                </p>
              </div>
              <p className="font-semibold">
                ${parseFloat(bill.estimated_amount).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}