'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { isSameMonth, isSameYear, parseISO, getMonth } from 'date-fns';
import { CHART_COLORS } from '@/lib/chart-colors';
import { toast } from "sonner";

// Type definitions
type Category = {
  id: number;
  name: string;
};

type Transaction = {
  amount: string;
  transaction_type: 'INCOME' | 'EXPENSE';
  date: string;
  category: number | null;
};

// Generic type for any paginated API response
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [breakdownTimeframe, setBreakdownTimeframe] = useState<string>('monthly');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiClient.get('/categories/'),
      apiClient.get('/transactions/')
    ]).then(([categoriesRes, transactionsRes]) => {
      const paginatedCategories: PaginatedResponse<Category> = categoriesRes.data;
      const paginatedTransactions: PaginatedResponse<Transaction> = transactionsRes.data;

      setCategories(paginatedCategories.results);
      setTransactions(paginatedTransactions.results);
      
    }).catch(error => {
        console.error('Failed to fetch data:', error);
        toast.error("Failed to load category data.");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Data processing for the "Spending Breakdown" vertical bar chart
  const breakdownChartData = useMemo(() => {
    const now = new Date();
    const filteredTransactions = transactions.filter(t => {
      if (t.transaction_type !== 'EXPENSE' || t.category === null) return false;
      const transactionDate = parseISO(t.date);
      if (breakdownTimeframe === 'monthly') return isSameMonth(transactionDate, now);
      if (breakdownTimeframe === 'yearly') return isSameYear(transactionDate, now);
      return true; // 'all-time'
    });

    const spendingByCategory: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const categoryName = categories.find(c => c.id === t.category)?.name || 'Uncategorized';
      if (!spendingByCategory[categoryName]) {
        spendingByCategory[categoryName] = 0;
      }
      spendingByCategory[categoryName] += parseFloat(t.amount);
    });

    return Object.entries(spendingByCategory)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

  }, [transactions, categories, breakdownTimeframe]);

  // Data processing for the "12-Month Trend" vertical stacked bar chart
  const monthlyTrendChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = monthNames.map(name => ({ name }));

    const expenseTransactions = transactions.filter(t => t.transaction_type === 'EXPENSE' && t.category !== null);
    
    expenseTransactions.forEach(t => {
      const monthIndex = getMonth(parseISO(t.date));
      const categoryName = categories.find(c => c.id === t.category)?.name;
      if (categoryName) {
        // @ts-ignore
        if (!data[monthIndex][categoryName]) { data[monthIndex][categoryName] = 0; }
        // @ts-ignore
        data[monthIndex][categoryName] += parseFloat(t.amount);
      }
    });
    return data;
  }, [transactions, categories]);

  const handleDelete = async (categoryId: number) => {
    setCategories(current => current.filter(c => c.id !== categoryId));
    try {
      await apiClient.delete(`/categories/${categoryId}/`);
      toast.success("Category Deleted");
    } catch (error) {
      console.error('Failed to delete category:', error);
      fetchData();
      toast.error("Delete Failed");
    }
  };

  const handleOpenDialog = (category: Category | null) => {
    setCurrentCategory(category);
    setCategoryName(category ? category.name : '');
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { name: categoryName };
    try {
      if (currentCategory) {
        await apiClient.patch(`/categories/${currentCategory.id}/`, data);
      } else {
        await apiClient.post('/categories/', data);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error("Failed to save category");
    }
  };

  if (loading) return <div>Loading analysis...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-secondary">Category Analysis</h1>
      <p className="mt-2 text-slate-500">Analyze your spending habits by category over time.</p>

      <Tabs defaultValue="breakdown" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Spending Breakdown</TabsTrigger>
          <TabsTrigger value="trend">12-Month Trend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={breakdownTimeframe} onValueChange={setBreakdownTimeframe}>
                <TabsList>
                  <TabsTrigger value="monthly">This Month</TabsTrigger>
                  <TabsTrigger value="yearly">This Year</TabsTrigger>
                  <TabsTrigger value="all-time">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-4 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  {/* FIX: Changed to a vertical bar chart with multiple colors */}
                  <BarChart data={breakdownChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {breakdownChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>Your total monthly expenses, broken down by category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {categories.map((category, index) => (
                      <Bar key={category.id} dataKey={category.name} stackId="a" fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-secondary">Manage Categories</h2>
          <Button onClick={() => handleOpenDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
        <Card className="mt-4">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(category)}>Edit</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>Deleting a category will remove it from all associated transactions.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g., Groceries" />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}