'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// Type definitions
type Account = {
  id: number;
  name: string;
  account_type: string;
};

type UserProfileSettings = {
  round_ups_enabled: boolean;
  round_up_source_account: number | null;
  round_up_target_account: number | null;
};

type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

function SettingsSkeleton() {
    return (
        <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-5 w-72" />
            <div className="mt-8">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Card className="mt-4">
                    <CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SettingsPage() {
  const { logout, status } = useAuthStore();
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState<UserProfileSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(() => {
    if (status === 'authenticated') {
      setLoading(true);
      Promise.all([
        apiClient.get('/profile/'),
        apiClient.get('/accounts/'),
        apiClient.get('/profile/settings/')
      ]).then(([profileRes, accountsRes, settingsRes]) => {
        setUsername(profileRes.data.username || '');
        setEmail(profileRes.data.email || '');
        const paginatedAccounts: PaginatedResponse<Account> = accountsRes.data;
        setAccounts(paginatedAccounts.results);
        setSettings(settingsRes.data);
      }).catch(error => console.error("Failed to fetch settings data:", error))
        .finally(() => setLoading(false));
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info("Updating profile...");
    try {
      await apiClient.patch('/profile/', { email });
      toast.success("Profile updated successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.info("Changing password...");
    try {
      await apiClient.put('/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!", {
        description: "For your security, you have been logged out."
      });
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.old_password?.[0] || "An unknown error occurred.";
      toast.error("Failed to change password.", { description: errorMessage });
    }
  };

  const handleSettingsUpdate = async () => {
    if (!settings) return;
    toast.info("Saving settings...");
    try {
      await apiClient.patch('/profile/settings/', settings);
      toast.success("Settings Saved");
    } catch (error) {
      toast.error("Save Failed");
    }
  };

  const handleRunRoundUps = async () => {
    toast.info("Processing round-ups...");
    try {
        const response = await apiClient.post('/run-round-ups/');
        toast.success("Round-ups complete!", { description: response.data.message });
        // After running, we should refetch transactions on other pages,
        // but for now, this provides the success feedback.
    } catch (error) {
        toast.error("Failed to run round-ups.");
    }
  };

  if (status === 'loading' || loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-secondary">Settings</h1>
      <p className="mt-2 text-slate-500">Manage your account settings and preferences.</p>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} disabled />
                  <p className="text-xs text-slate-500">Your username cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>For security, you will be logged out after changing your password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <Input id="old_password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle>Automated Savings</CardTitle>
              <CardDescription>Set up rules to save money automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Round-Ups</h3>
                  <p className="text-sm text-slate-500">Automatically save spare change from your purchases.</p>
                </div>
                <Switch
                  checked={settings?.round_ups_enabled || false}
                  onCheckedChange={(checked) => setSettings(p => p ? {...p, round_ups_enabled: checked} : null)}
                />
              </div>

              {settings?.round_ups_enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Round up from account</Label>
                    <Select
                      value={String(settings.round_up_source_account || '')}
                      onValueChange={(value) => setSettings(p => p ? {...p, round_up_source_account: Number(value)} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(a => a.account_type === 'CHECKING').map(acc => (
                          <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer to savings account</Label>
                     <Select
                      value={String(settings.round_up_target_account || '')}
                      onValueChange={(value) => setSettings(p => p ? {...p, round_up_target_account: Number(value)} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a target account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(a => a.account_type === 'SAVINGS').map(acc => (
                          <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <Button onClick={handleSettingsUpdate}>Save Settings</Button>
                    <Button variant="outline" onClick={handleRunRoundUps}>Run Round-Ups Now</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}