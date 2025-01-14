import { Card, CardContent } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { SignInForm } from "@/components/auth/SignInForm";
import { useLocation } from "react-router-dom";

export default function AuthPage() {
  const location = useLocation();
  const view = location.pathname === "/auth" ? "sign_in" : "update_password";

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-[#00A979]">
      <AuthSidebar view={view} />
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
          <AuthHeader view={view} />
          <CardContent className="pb-3">
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}