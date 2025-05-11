
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet2 } from "lucide-react";

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
import { useAuth } from "@/lib/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const isSignIn = type === "signin";
  const schema = isSignIn ? loginSchema : signupSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignIn ? {} : { name: "", confirmPassword: "" }),
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);
    
    try {
      if (isSignIn) {
        await signIn(values.email, values.password);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        await signUp(values.email, values.password, (values as any).name);
        toast({
          title: "Account created!",
          description: "Your account has been successfully created.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8 p-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-budget-green flex items-center justify-center mb-4">
          <Wallet2 className="text-white h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">
          {isSignIn ? "Sign in to your account" : "Create a new account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isSignIn 
            ? "Enter your credentials to access your account" 
            : "Enter your information to create a new account"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isSignIn && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isSignIn && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button type="submit" className="w-full bg-budget-green hover:bg-budget-green/90" disabled={isLoading}>
            {isLoading ? (
              <span className="loader"></span>
            ) : isSignIn ? "Sign in" : "Create account"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            to={isSignIn ? "/signup" : "/signin"}
            className="font-semibold text-budget-green hover:underline"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-1">This is a demo application. No real authentication is performed yet.</p>
        <p className="font-medium mt-2">
          Connect to Supabase to enable real authentication and database functionality.
        </p>
      </div>
    </div>
  );
}
