'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { AddInvestmentAccountDialog } from '@/components/add-investment-account-dialog';
import { AddHoldingDialog } from '@/components/add-holding-dialog';
import { EditHoldingDialog } from '@/components/edit-holding-dialog';
import { EditInvestmentAccountDialog } from '@/components/edit-investment-account-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";

// --- Type Definitions ---
type Holding = {
  id: number;
  symbol: string;
  shares: string;
  cost_basis: string;
  current_price?: number;
  market_value?: number;
  gain_loss?: number;
};

type InvestmentAccount = {
  id: number;
  name: string;
  brokerage: string;
  holdings: Holding[];
};

// Generic type for a paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export default function InvestmentsPage() {
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestmentData = useCallback(async () => {
    setLoading(true);
    try {
      const accountsRes = await apiClient.get('/investments/');
      // FIX: Extract the 'results' array from the paginated response
      const paginatedData: PaginatedResponse<InvestmentAccount> = accountsRes.data;
      const investmentAccounts = paginatedData.results;

      for (const acc of investmentAccounts) {
        for (const holding of acc.holdings) {
          try {
            const priceRes = await apiClient.get(`/stock-price/?symbol=${holding.symbol}`);
            holding.current_price = priceRes.data.price;
            holding.market_value = parseFloat(holding.shares) * (holding.current_price ?? 0);
            holding.gain_loss = holding.market_value - parseFloat(holding.cost_basis);
          } catch (priceError) {
            console.error(`Failed to fetch price for ${holding.symbol}`, priceError);
            holding.current_price = 0;
            holding.market_value = 0;
            holding.gain_loss = -parseFloat(holding.cost_basis);
          }
        }
      }
      setAccounts(investmentAccounts);
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
      toast.error("Failed to load investment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestmentData();
  }, [fetchInvestmentData]);

  const handleDeleteHolding = async (holdingId: number) => {
    setAccounts(currentAccounts => 
      currentAccounts.map(acc => ({
        ...acc,
        holdings: acc.holdings.filter(h => h.id !== holdingId)
      }))
    );
    try {
      await apiClient.delete(`/holdings/${holdingId}/`);
      toast.success("Holding Deleted");
    } catch (error) {
      console.error('Failed to delete holding:', error);
      fetchInvestmentData();
      toast.error("Delete Failed");
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    setAccounts(currentAccounts => currentAccounts.filter(acc => acc.id !== accountId));
    try {
      await apiClient.delete(`/investments/${accountId}/`);
      toast.success("Investment Account Deleted");
    } catch (error) {
      console.error('Failed to delete investment account:', error);
      fetchInvestmentData();
      toast.error("Delete Failed");
    }
  };

  if (loading) return <div>Loading investment data...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">Investments</h1>
          <p className="mt-2 text-slate-500">Track your portfolio performance.</p>
        </div>
        <AddInvestmentAccountDialog onSuccess={fetchInvestmentData} />
      </div>

      <div className="mt-8 space-y-8">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{account.name}</CardTitle>
                <CardDescription>{account.brokerage}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <AddHoldingDialog
                  investmentAccountId={account.id}
                  onSuccess={fetchInvestmentData}
                />
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditInvestmentAccountDialog account={account} onSuccess={fetchInvestmentData}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit Account
                        </DropdownMenuItem>
                      </EditInvestmentAccountDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600">Delete Account</DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this investment account and all of its holdings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAccount(account.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Cost Basis</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.holdings.length > 0 ? (
                    account.holdings.map((holding) => (
                      <TableRow key={holding.id}>
                        <TableCell className="font-medium">{holding.symbol}</TableCell>
                        <TableCell>{parseFloat(holding.shares).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(holding.cost_basis).toLocaleString()}</TableCell>
                        <TableCell>${holding.current_price ? holding.current_price.toFixed(2) : '...'}</TableCell>
                        <TableCell className="font-semibold">
                          ${holding.market_value ? holding.market_value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '...'}
                        </TableCell>
                        <TableCell className={holding.gain_loss === undefined ? '' : (holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {holding.gain_loss !== undefined ? holding.gain_loss.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '...'}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <EditHoldingDialog holding={holding} onSuccess={fetchInvestmentData}>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit
                                  </DropdownMenuItem>
                                </EditHoldingDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete this holding from your account.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteHolding(holding.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                        No holdings added to this account yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}