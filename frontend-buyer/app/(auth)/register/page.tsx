import type { Metadata } from 'next';
import { RegisterForm } from './components/RegisterForm';

export const metadata: Metadata = { title: 'Sign up' };

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Join the ArtToy Market community</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
