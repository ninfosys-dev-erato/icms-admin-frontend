import { redirect } from 'next/navigation';

export default function HomePage() {
  // This will be handled by middleware, but as a fallback
  // redirect to dashboard (middleware will handle auth)
  redirect('/admin/dashboard');
} 