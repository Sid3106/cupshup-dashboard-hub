import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthHeaderProps {
  view: 'sign_in' | 'update_password';
}

export const AuthHeader = ({ view }: AuthHeaderProps) => (
  <CardHeader className="space-y-1 text-left py-3">
    <CardTitle className="text-2xl">
      {view === 'update_password' ? 'Reset Password' : 'Sign in'}
    </CardTitle>
    <CardDescription>
      {view === 'update_password' 
        ? 'Enter your new password below'
        : 'Enter your email and password to sign in'}
    </CardDescription>
  </CardHeader>
);