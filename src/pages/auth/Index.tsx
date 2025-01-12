import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [email, setEmail] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false, // Only allow existing users
        },
      });

      if (error) throw error;

      setEmail(values.email);
      setShowOTPInput(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP",
      });
    } catch (error: any) {
      console.error('Email submission error:', error);
      setAuthError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleOTPSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: 'email',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully logged in",
      });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setAuthError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

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
            
            {!showOTPInput ? (
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
                  <Button type="submit" className="w-full bg-[#00A979]">
                    Send OTP
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter OTP</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Button type="submit" className="w-full bg-[#00A979]">
                      Verify OTP
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowOTPInput(false);
                        setAuthError(null);
                      }}
                    >
                      Back to Email
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}