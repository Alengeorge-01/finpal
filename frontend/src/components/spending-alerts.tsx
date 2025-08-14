'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

export default function SpendingAlerts() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/spending-alerts/');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch spending alerts:', error);
      toast.error("Could not load spending alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

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
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Alerts</CardTitle>
        <CardDescription>
          We've analyzed your recent spending for anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <ul className="space-y-4">
            {alerts.map((alert, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-sm text-slate-700">{alert}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No unusual spending detected. Great job sticking to your habits!</p>
        )}
      </CardContent>
    </Card>
  );
}