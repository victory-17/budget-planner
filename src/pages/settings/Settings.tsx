import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { TopNavigation } from "@/components/layout/top-navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  DollarSign,
  Loader2
} from "lucide-react";

// Profile form schema
const profileFormSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  age: z.string().refine((val) => !val || !isNaN(parseInt(val)), {
    message: "Age must be a number",
  }),
  currency: z.string().min(1, "Currency is required"),
  phone: z.string().optional(),
});

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || user?.user_metadata?.name?.split(' ')[0] || "",
      last_name: profile?.last_name || user?.user_metadata?.name?.split(' ')[1] || "",
      email: user?.email || "",
      age: "",
      currency: "USD",
      phone: "",
    },
  });

  // Handle profile form submission
  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      
      // Extract values we want to update
      const { first_name, last_name } = data;
      
      // Update profile in Supabase
      await updateProfile({
        first_name,
        last_name,
        updated_at: new Date().toISOString(),
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate user initials for avatar
  const generateInitials = () => {
    const firstName = profileForm.watch("first_name");
    const lastName = profileForm.watch("last_name");
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    
    return "U";
  };

  return (
    <div>
      <TopNavigation 
        title="Settings" 
        subtitle="Manage your profile information" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how it appears on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {generateInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" className="mb-1">Change Avatar</Button>
                      <p className="text-sm text-muted-foreground">PNG, JPG or GIF, max 1MB</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          This is your verified email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Account Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Configure account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={field.value === "USD" ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => field.onChange("USD")}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            USD
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "EUR" ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => field.onChange("EUR")}
                          >
                            <span className="mr-2">€</span>
                            EUR
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "GBP" ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => field.onChange("GBP")}
                          >
                            <span className="mr-2">£</span>
                            GBP
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "EGP" ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => field.onChange("EGP")}
                          >
                            <span className="mr-2">£</span>
                            EGP
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
