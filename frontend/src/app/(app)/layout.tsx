import HeaderDashboard from '@/components/header-dashboard';
import Sidebar from '@/components/sidebar';
import { Toaster } from "@/components/ui/sonner"; // Import the new Toaster

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <HeaderDashboard />
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          {children}
        </main>
      </div>
      <Toaster richColors /> {/* Add the Toaster component here */}
    </div>
  );
}