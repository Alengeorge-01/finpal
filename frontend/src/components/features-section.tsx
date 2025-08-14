'use client';

import {
  BarChart,
  DollarSign,
  ShieldCheck,
  PiggyBank,
  Wallet,
  BrainCircuit,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion, Variants } from 'framer-motion'; // Import Variants type

const features = [
  {
    icon: <Wallet className="h-8 w-8 text-brand-primary" />,
    title: 'Unified Dashboard',
    description: 'See all your checking, savings, credit, and investment accounts in one clean interface.',
  },
  {
    icon: <PiggyBank className="h-8 w-8 text-brand-primary" />,
    title: 'Smart Budgeting',
    description: 'Create, track, and manage your budgets effortlessly with intelligent suggestions.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-brand-primary" />,
    title: 'Transaction Insights',
    description: 'Automatic categorization and deep analysis of your spending habits and trends.',
  },
  {
    icon: <DollarSign className="h-8 w-8 text-brand-primary" />,
    title: 'Investment Tracking',
    description: 'Monitor your portfolio’s performance with real-time data and market updates.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-brand-primary" />,
    title: 'Bill Management',
    description: 'Never miss a due date again. Track all your bills and subscriptions in one place.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-brand-primary" />,
    title: 'AI Financial Goals',
    description: 'Get personalized, AI-driven advice and plans to help you reach your financial goals faster.',
  },
];

export default function FeaturesSection() {
  // Explicitly type the constant with Variants
  const cardVariants: Variants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        // REMOVED duration from here
      },
    },
  };

  return (
    <section id="features" className="w-full bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            FinPal provides the perfect toolset to understand and improve your financial health.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              variants={cardVariants}
            >
              <Card className="h-full">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}