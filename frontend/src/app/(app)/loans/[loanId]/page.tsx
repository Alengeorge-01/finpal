'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, parseISO, format, addMonths } from 'date-fns';
import { AddLoanPaymentDialog } from '@/components/add-loan-payment-dialog';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions
type LoanPayment = { id: number; date: string; amount: string; };
type LoanDisbursement = { id: number; date: string; amount: string; };
type Loan = {
  id: number;
  name: string;
  slug: string;
  interest_rate: string;
  repayment_start_date: string;
  payments: LoanPayment[];
  disbursements: LoanDisbursement[];
};
type AmortizationRow = { month: number; date: string; payment: number; principal: number; interest: number; endingDebt: number; };

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.loanId as string;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [debtHistory, setDebtHistory] = useState<{ date: string; debt: number }[]>([]);
  const [activeSchedule, setActiveSchedule] = useState<string>('10-year');

  const calculateLoanDetails = useCallback((loanData: Loan) => {
    const allEvents = [
      ...loanData.disbursements.map(d => ({ type: 'disbursement', date: parseISO(d.date), amount: parseFloat(d.amount) })),
      ...loanData.payments.map(p => ({ type: 'payment', date: parseISO(p.date), amount: parseFloat(p.amount) }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allEvents.length === 0) {
        setCurrentBalance(0);
        setDebtHistory([]);
        return;
    }

    let balance = 0;
    let lastEventDate = allEvents[0].date;
    const dailyRate = parseFloat(loanData.interest_rate) / 100 / 365;
    const history = [{ date: format(lastEventDate, 'yyyy-MM-dd'), debt: 0 }];

    allEvents.forEach(event => {
      const days = differenceInDays(event.date, lastEventDate);
      if (days > 0 && balance > 0) {
        balance += balance * dailyRate * days;
      }
      if (event.type === 'disbursement') {
        balance += event.amount;
      } else {
        balance -= event.amount;
      }
      history.push({ date: format(event.date, 'yyyy-MM-dd'), debt: balance });
      lastEventDate = event.date;
    });

    const days = differenceInDays(new Date(), lastEventDate);
    if (days > 0 && balance > 0) {
      balance += balance * dailyRate * days;
      history.push({ date: format(new Date(), 'yyyy-MM-dd'), debt: balance });
    }
    
    setCurrentBalance(balance > 0 ? balance : 0);
    setDebtHistory(history);
  }, []);

  const fetchLoanDetails = useCallback(async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/loans/${loanId}/`);
      setLoan(response.data);
      calculateLoanDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
    } finally {
      setLoading(false);
    }
  }, [loanId, calculateLoanDetails]);

  useEffect(() => {
    fetchLoanDetails();
  }, [fetchLoanDetails]);
  
  const calculateProjection = (principal: number, rate: number, months: number): { schedule: AmortizationRow[], emi: number } => {
    if (principal <= 0 || months <= 0 || !rate) return { schedule: [], emi: 0 };
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    let schedule: AmortizationRow[] = [];
    let remainingBalance = principal;
    for (let i = 1; i <= months; i++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      remainingBalance -= principalForMonth;
      schedule.push({
        month: i,
        date: format(addMonths(new Date(), i), 'dd MMM, yyyy'),
        payment: emi,
        principal: principalForMonth,
        interest: interestForMonth,
        endingDebt: remainingBalance > 0 ? remainingBalance : 0,
      });
    }
    return { schedule, emi };
  };
  
  const tenYearPlan = useMemo(() => calculateProjection(currentBalance, parseFloat(loan?.interest_rate || '0'), 120), [currentBalance, loan]);
  const fiveYearPlan = useMemo(() => calculateProjection(currentBalance, parseFloat(loan?.interest_rate || '0'), 60), [currentBalance, loan]);
  const threeYearPlan = useMemo(() => calculateProjection(currentBalance, parseFloat(loan?.interest_rate || '0'), 36), [currentBalance, loan]);

  const scheduleMap = {
    '10-year': tenYearPlan,
    '5-year': fiveYearPlan,
    '3-year': threeYearPlan,
  };
  // @ts-ignore
  const selectedSchedule = scheduleMap[activeSchedule];

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-1/2 mb-8" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!loan) {
    return <div>Loan not found.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">{loan.name}</h1>
          <p className="mt-2 text-slate-500">Repayment starts on {format(parseISO(loan.repayment_start_date), 'dd MMM, yyyy')} at {loan.interest_rate}% APR</p>
        </div>
        <AddLoanPaymentDialog loanId={loan.id} onSuccess={fetchLoanDetails} />
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plans">Repayment Plans</TabsTrigger>
          <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Current Balance</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold">{currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Debt History</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={debtHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="debt" stroke="#386BF6" strokeWidth={2} dot={false} />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-4 grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader><CardTitle>10-Year Plan</CardTitle><CardDescription>120 Months</CardDescription></CardHeader>
                <CardContent><p className="text-2xl font-bold">{tenYearPlan.emi.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / mo</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>5-Year Plan</CardTitle><CardDescription>60 Months</CardDescription></CardHeader>
                <CardContent><p className="text-2xl font-bold">{fiveYearPlan.emi.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / mo</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>3-Year Plan</CardTitle><CardDescription>36 Months</CardDescription></CardHeader>
                <CardContent><p className="text-2xl font-bold">{threeYearPlan.emi.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / mo</p></CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <Tabs value={activeSchedule} onValueChange={setActiveSchedule}>
                <TabsList>
                  <TabsTrigger value="10-year">10-Year Plan</TabsTrigger>
                  <TabsTrigger value="5-year">5-Year Plan</TabsTrigger>
                  <TabsTrigger value="3-year">3-Year Plan</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Ending Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSchedule.schedule.map((row: AmortizationRow) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>${row.payment.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">${row.principal.toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">${row.interest.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">${row.endingDebt.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}