
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Mail, Lock, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { login, checkAuth } from "@/lib/features/auth/auth-slice";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    dispatch(checkAuth());
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, dispatch]);

  useEffect(() => {
    if (error) {
      toast({ title: "Login failed", description: error, variant: "destructive" });
    }
  }, [error]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Nexus Tasks</span>
          </Link>
          <h1 className="text-3xl font-bold mt-6 tracking-tight">Sign in to your account</h1>
          <p className="text-muted-foreground">Welcome back to your productivity hub</p>
        </div>

        <Card className="border-none shadow-xl bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Enter your email and password to access your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="name@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full py-6 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-muted/30 rounded-b-lg">
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Register now
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
