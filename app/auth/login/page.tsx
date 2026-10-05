'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace(redirectTo.startsWith('/') ? redirectTo : '/dashboard');
    router.refresh();
  }

  return <SiteShell><div className="container-page flex min-h-[calc(100vh-9rem)] items-center justify-center py-10"><Card className="w-full max-w-md"><CardHeader className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><LockKeyhole className="h-6 w-6"/></div><CardTitle className="mt-2 text-2xl">Sign In</CardTitle><p className="text-sm text-muted-foreground">Access your saved jobs, applications and alerts.</p></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">
  <div><Label htmlFor="email">Email</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="pl-9" placeholder="you@example.com"/></div></div>
  <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1" placeholder="Your password"/></div>
  {error&&<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  <Button type="submit" disabled={loading} className="w-full">{loading&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Sign In</Button>
</form><p className="mt-5 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link className="font-semibold text-primary hover:underline" href={'/auth/register?redirectTo='+encodeURIComponent(redirectTo)}>Create one</Link></p></CardContent></Card></div></SiteShell>;
}

export const metadata = { title: 'Sign In' };