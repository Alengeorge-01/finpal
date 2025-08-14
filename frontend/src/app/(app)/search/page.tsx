'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { Search as SearchIcon } from 'lucide-react';

// Type definitions for the API response
type SearchResult = {
  query_interpretation: string;
  result_type: 'sum' | 'list' | 'error';
  data: any;
  insight: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) {
      toast.warning("Please enter a question.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await apiClient.post('/ai/natural-language-query/', { query });
      setResult(response.data);
    } catch (error) {
      console.error("Failed to execute query:", error);
      toast.error("Query Failed", {
        description: "There was a problem communicating with the AI service."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-secondary">Natural Language Search</h1>
        <p className="mt-2 text-slate-500">Ask questions about your finances in plain English.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'How much did I spend on groceries in March?'"
          className="flex-grow"
        />
        <Button type="submit" disabled={loading}>
          <SearchIcon className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {loading && (
        <Card>
          <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>{result.query_interpretation}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Conditionally render the result based on its type */}
            {result.result_type === 'sum' && (
              <div className="text-4xl font-bold">
                {Number(result.data.total).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div>
            )}

            {result.result_type === 'list' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">${item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {result.result_type === 'error' && (
              <p className="text-red-600">{result.insight}</p>
            )}

            {result.insight && result.result_type !== 'error' && (
              <p className="mt-4 text-sm text-slate-500 border-t pt-4">
                <strong>Insight:</strong> {result.insight}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}