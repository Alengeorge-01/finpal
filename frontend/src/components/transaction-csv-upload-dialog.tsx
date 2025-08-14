'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { toast } from "sonner";

// Type definitions
type Account = {
  id: number;
  name: string;
};

interface TransactionCSVUploadDialogProps {
  accounts: Account[];
  onSuccess: () => void;
}

export function TransactionCSVUploadDialog({ accounts, onSuccess }: TransactionCSVUploadDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || !selectedAccountId) {
      toast.error("Please select a file and an account.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('account_id', selectedAccountId);

    toast.info("Uploading transactions...", { description: "This may take a moment." });

    try {
      const response = await apiClient.post('/transactions/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsDialogOpen(false);
      setSelectedFile(null);
      setSelectedAccountId('');
      onSuccess();
      toast.success("Upload Complete", { description: response.data.message });
    } catch (error: any) {
      console.error('Failed to upload transactions:', error);
      toast.error("Upload Failed", { description: error.response?.data?.error || "There was a problem with your file." });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
          <DialogDescription>
            Select an account and upload a CSV file with columns: Date, Description, Amount, Category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account
              </Label>
              <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Import to..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                CSV File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Upload Transactions</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}