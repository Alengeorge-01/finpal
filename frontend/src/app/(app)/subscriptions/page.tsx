'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format, parseISO } from 'date-fns';
import { toast } from "sonner";

// Type definitions
type Subscription = {
  id: number;
  name: string;
  last_payment_date: string;
  estimated_amount: string;
  is_active: boolean;
};

type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const PAGE_SIZE = 15;

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // State for the Add/Edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const fetchSubscriptions = useCallback((page: number) => {
    setLoading(true);
    apiClient.get(`/subscriptions/?page=${page}`)
      .then(res => {
        const paginatedData: PaginatedResponse<Subscription> = res.data;
        setSubscriptions(paginatedData.results);
        setTotalCount(paginatedData.count);
      })
      .catch(error => console.error('Failed to fetch subscriptions:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubscriptions(currentPage);
  }, [currentPage, fetchSubscriptions]);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    toast.info("Scanning all transactions for new subscriptions...");
    try {
      const response = await apiClient.post('/subscriptions/discover/');
      toast.success(response.data.message);
      fetchSubscriptions(1); // Refresh the list from the first page
    } catch (error) {
      toast.error("Discovery Failed", { description: "There was a problem scanning your transactions."});
      console.error('Discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleDelete = async (subscriptionId: number) => {
    setSubscriptions(current => current.filter(s => s.id !== subscriptionId));
    try {
      await apiClient.delete(`/subscriptions/${subscriptionId}/`);
      toast.success("Subscription Deleted");
      fetchSubscriptions(currentPage);
    } catch (error) {
      toast.error("Delete Failed");
      fetchSubscriptions(currentPage);
    }
  };

  const handleOpenDialog = (subscription: Subscription | null) => {
    setCurrentSubscription(subscription);
    if (subscription) {
      setName(subscription.name);
      setAmount(subscription.estimated_amount);
      setDate(subscription.last_payment_date);
    } else {
      setName('');
      setAmount('');
      setDate('');
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      name,
      estimated_amount: amount,
      last_payment_date: date,
    };
    try {
      if (currentSubscription) {
        await apiClient.patch(`/subscriptions/${currentSubscription.id}/`, data);
        toast.success("Subscription Updated");
      } else {
        await apiClient.post('/subscriptions/', data);
        toast.success("Subscription Added");
      }
      setIsDialogOpen(false);
      fetchSubscriptions(1); // Go back to first page to see the new item
    } catch (error) {
      toast.error("Failed to save subscription");
      console.error('Failed to save subscription:', error);
    }
  };

  if (loading) return <div>Loading subscriptions...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Subscriptions</h1>
          <p className="mt-2 text-slate-500">Manage your recurring payments and subscriptions.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
            </Button>
            <Button onClick={handleDiscover} disabled={isDiscovering} variant="outline">
                <Search className="mr-2 h-4 w-4" /> 
                {isDiscovering ? 'Scanning...' : 'Discover'}
            </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... The Add/Edit Dialog code remains the same ... */}
      </Dialog>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Detected Subscriptions</CardTitle>
          <CardDescription>
            These are recurring expenses found in your transaction history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            {/* ... The TableHeader remains the same ... */}
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium capitalize">{sub.name}</TableCell>
                    <TableCell>{format(parseISO(sub.last_payment_date), 'dd MMM, yyyy')}</TableCell>
                    <TableCell className="text-right">${parseFloat(sub.estimated_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      {/* ... The DropdownMenu and AlertDialog for actions ... */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No subscriptions found. Click "Discover" to scan your transactions.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          <PaginationItem>
              <span className="p-2 text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}