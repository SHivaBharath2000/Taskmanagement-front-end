"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (apiClient.auth.isLoggedIn()) {
      router.push("/dashboard");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-center">
           <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg">
             <CheckCircle2 size={32} />
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary">
          Nexus Tasks
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The professional workspace to organize, track, and achieve your goals with unparalleled clarity and focus.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:200ms]">
        <Button asChild size="lg" className="px-8 py-6 text-lg">
          <Link href="/login">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
          <Link href="/register">Create Account</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 animate-fade-in [animation-delay:400ms]">
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4">
            <LayoutDashboard size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Smart Dashboard</h3>
          <p className="text-sm text-muted-foreground">Keep an eye on everything with our clean, responsive card-based layout.</p>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Instant Updates</h3>
          <p className="text-sm text-muted-foreground">Real-time task toggling and simple toast notifications for every action.</p>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4">
             <ArrowRight size={20} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Power Search</h3>
          <p className="text-sm text-muted-foreground">Find exactly what you need with advanced filtering and search features.</p>
        </div>
      </div>
    </div>
  );
}
