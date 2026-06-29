import type { Metadata } from 'next';
import { ProfileView } from './components/ProfileView';

export const metadata: Metadata = { title: 'My Profile' };

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileView />
    </div>
  );
}
