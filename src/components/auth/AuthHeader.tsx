import { CardHeader, CardTitle } from "@/components/ui/card";

interface AuthHeaderProps {
  view: 'sign_in' | 'update_password';
}

export const AuthHeader = ({ view }: AuthHeaderProps) => (
  <CardHeader className="space-y-0.5 text-left py-2">
    <CardTitle className="text-2xl">
      {view === 'update_password' ? 'Reset Password' : 'Sign in'}
    </CardTitle>
  </CardHeader>
);