'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter(); const searchParams=useSearchParams();
  const redirectTo=searchParams.get('redirectTo')||'/dashboard';
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setError(''); setMessage('');
    if(password.length<6){setError('Password must be at least 6 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setLoading(true);
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()||null}}});
    if(error){setLoading(false);setError(error.message);return;}
    if(data.user&&data.session){
      await supabase.from('profiles').upsert({user_id:data.user.id,full_name:name.trim()||null},{onConflict:'user_id'});
      setLoading(false); router.replace(redirectTo.startsWith('/')?redirectTo:'/dashboard'); router.refresh(); return;
    }
    setLoading(false); setMessage('Account created. Check your email to confirm your account, then sign in.');
  }

  return <SiteShell><div className="container-page flex min-h-[calc(100vh-9rem)] items-center justify-center py-10"><Card className="w-full max-w-md"><CardHeader className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserPlus className="h-6 w-6"/></div><CardTitle className="mt-2 text-2xl">Create Your Account</CardTitle><p className="text-sm text-muted-foreground">Save jobs, track applications and manage alerts.</p></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">
  <div><Label htmlFor="name">Full name</Label><Input id="name" required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="mt-1" placeholder="Your full name"/></div>
  <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1" placeholder="you@example.com"/></div>
  <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1" placeholder="At least 6 characters"/></div>
  <div><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1" placeholder="Re-enter password"/></div>
  {error&&<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
  {message&&<p role="status" className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p>}
  <Button type="submit" disabled={loading} className="w-full">{loading&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Create Account</Button>
</form><p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-semibold text-primary hover:underline" href={'/auth/login?redirectTo='+encodeURIComponent(redirectTo)}>Sign In</Link></p></CardContent></Card></div></SiteShell>;
}
