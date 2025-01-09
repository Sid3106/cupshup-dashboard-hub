interface AuthSidebarProps {
  view: 'sign_in' | 'update_password';
}

export const AuthSidebar = ({ view }: AuthSidebarProps) => (
  <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
    <div className="absolute inset-0 bg-zinc-900" />
    <div className="relative z-20 flex items-center text-lg font-medium">
      <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
    </div>
    <div className="relative z-20 mt-auto">
      <blockquote className="space-y-2">
        <p className="text-lg">
          {view === 'update_password' 
            ? 'Reset your password to continue.' 
            : 'Welcome to our platform. Please sign in to continue.'}
        </p>
      </blockquote>
    </div>
  </div>
);