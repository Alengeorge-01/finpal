'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { useDebounce } from 'use-debounce'; // We'll need to install this hook

// Type definitions
type Account = { id: number; name: string; };
type Category = { id: number; name: string; };

interface AddTransactionDialogProps {
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
}

export function AddTransactionDialog({ accounts, categories, onSuccess }: AddTransactionDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [allCategories, setAllCategories] = useState<Category[]>(categories);

  // --- AI Suggester Logic ---
  const [debouncedDescription] = useDebounce(description, 500); // Wait 500ms after user stops typing

  useEffect(() => {
    const suggestCategory = async () => {
      if (debouncedDescription.length > 3) { // Only search for descriptions longer than 3 chars
        try {
          const res = await apiClient.get(`/ai/suggest-category/?description=${debouncedDescription}`);
          if (res.data && res.data.id) {
            setCategoryId(String(res.data.id)); // Set the suggested category
            toast.info(`Suggested category: ${res.data.name}`);
          }
        } catch (error) {
          console.error("Category suggestion failed:", error);
        }
      }
    };
    suggestCategory();
  }, [debouncedDescription]);
  // --- End of AI Suggester Logic ---


  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    // ... (this function remains the same)
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // ... (this function remains the same)
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* ... Dialog implementation remains the same, no changes to JSX needed ... */}
    </Dialog>
  );
}