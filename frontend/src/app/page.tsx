import Header from "@/components/header"; // Correct header for the landing page
import FeaturesSection from "@/components/features-section";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden text-brand-secondary">
      <Header />
      <main className="flex min-h-[calc(100vh-80px)] items-center">
        <section className="container mx-auto flex flex-col items-center px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Master Your Money,
            <br />
            <span className="text-brand-primary">Effortlessly</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
            FinPal is your all-in-one dashboard for tracking spending, managing
            budgets, and growing your investments. Take control of your financial
            future today.
          </p>
          <div className="mt-8">
            <Link href="/#features">
              <Button size="lg">
                Explore Features <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <FeaturesSection />
    </div>
  );
}