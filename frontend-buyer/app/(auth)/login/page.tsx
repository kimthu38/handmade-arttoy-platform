import type { Metadata } from 'next';
import { LoginForm } from './components/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-muted-foreground">Welcome back to ArtToy Market</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
