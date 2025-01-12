import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function AuthPage() {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      // Check if we're in cooldown period
      if (cooldownEndTime && Date.now() < cooldownEndTime) {
        const remainingSeconds = Math.ceil((cooldownEndTime - Date.now()) / 1000);
        toast({
          variant: "destructive",
          title: "Please wait",
          description: `You can try again in ${remainingSeconds} seconds`,
        });
        return;
      }

      setIsSubmitting(true);
      setAuthError(null);
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (signInError) {
        if (signInError.message.includes("User not found")) {
          setAuthError("Please contact someone from CupShup for access");
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Please contact someone from CupShup for access",
          });
          return;
        }

        // Handle rate limit error
        if (signInError.message.includes("rate_limit")) {
          const waitSeconds = 22; // Supabase's required wait time
          const endTime = Date.now() + (waitSeconds * 1000);
          setCooldownEndTime(endTime);
          toast({
            variant: "destructive",
            title: "Too many attempts",
            description: `Please wait ${waitSeconds} seconds before trying again`,
          });
          return;
        }

        throw signInError;
      }

      toast({
        title: "Magic Link Sent",
        description: "Check your email to sign in",
      });
      
      // Set cooldown after successful send
      const endTime = Date.now() + (22 * 1000);
      setCooldownEndTime(endTime);
      
    } catch (error: any) {
      console.error('Email submission error:', error);
      setAuthError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate remaining cooldown time
  const remainingCooldown = cooldownEndTime && Date.now() < cooldownEndTime
    ? Math.ceil((cooldownEndTime - Date.now()) / 1000)
    : null;

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-[#00A979]">
      <AuthSidebar view="sign_in" />
      <div className="p-4 lg:p-6 h-full flex items-center justify-center">
        <Card className="mx-auto w-full max-w-sm">
          <div className="flex flex-col items-center pt-4">
            <img 
              src="https://zdslyhsaebzabstxskgd.supabase.co/storage/v1/object/sign/cupshup_images/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwX2ltYWdlcy9DdXBTaHVwTG9nby5wbmciLCJpYXQiOjE3MzYzODU2NjIsImV4cCI6MTc2NzkyMTY2Mn0.Ui1vKAwvRcJ-qPbPC7U74ywOwiRUMZo4j8-eARVr6rs&t=2025-01-09T01%3A21%3A02.723Z" 
              alt="CupShup Logo" 
              className="h-12 w-auto mb-2"
            />
            <p className="font-roboto text-[#00A979] text-lg font-bold mb-2">Let's Brew Innovation!</p>
          </div>
          <AuthHeader view="sign_in" />
          <CardContent className="pb-3">
            {authError && (
              <Alert variant="destructive" className="mb-3">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#00A979]" 
                  disabled={isSubmitting || !!remainingCooldown}
                >
                  {remainingCooldown 
                    ? `Wait ${remainingCooldown}s` 
                    : isSubmitting 
                      ? "Sending..." 
                      : "Log In"
                  }
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}