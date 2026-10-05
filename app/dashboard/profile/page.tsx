'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [userId,setUserId]=useState(''); const [email,setEmail]=useState(''); const [form,setForm]=useState({full_name:'',date_of_birth:'',qualification:'',discipline:'',graduation_year:'',state:''}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState('');

  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser(); if(!user){setLoading(false);return;} setUserId(user.id);setEmail(user.email??''); const {data}=await supabase.from('profiles').select('full_name,date_of_birth,qualification,discipline,graduation_year,state').eq('user_id',user.id).maybeSingle(); if(data)setForm({full_name:data.full_name??'',date_of_birth:data.date_of_birth??'',qualification:data.qualification??'',discipline:data.discipline??'',graduation_year:data.graduation_year?.toString()??'',state:data.state??''});setLoading(false);})()},[]);

  async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setMessage('');const {error}=await supabase.from('profiles').upsert({user_id:userId,full_name:form.full_name||null,date_of_birth:form.date_of_birth||null,qualification:form.qualification||null,discipline:form.discipline||null,graduation_year:form.graduation_year?Number(form.graduation_year):null,state:form.state||null,updated_at:new Date().toISOString()},{onConflict:'user_id'});setSaving(false);setMessage(error?error.message:'Profile updated successfully.');}

  if(loading)return <SiteShell><div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div></SiteShell>;
  if(!userId)return <SiteShell><div className="container-page py-12"><Card className="mx-auto max-w-lg"><CardContent className="p-8 text-center"><UserCircle className="mx-auto h-12 w-12 text-muted-foreground"/><h1 className="mt-4 text-2xl font-bold">Sign in to edit your profile</h1><Button asChild className="mt-5"><Link href="/auth/login?redirectTo=%2Fdashboard%2Fprofile">Sign In</Link></Button></CardContent></Card></div></SiteShell>;

  return <SiteShell><div className="container-page py-8 sm:py-10"><div className="mb-6"><p className="text-sm font-medium text-primary">Account</p><h1 className="mt-1 font-display text-2xl font-bold">Profile & Settings</h1><p className="mt-1 text-sm text-muted-foreground">{email}</p></div><Card className="max-w-2xl"><CardHeader><CardTitle>Personal information</CardTitle></CardHeader><CardContent><form onSubmit={save} className="space-y-4">
  <div><Label>Full name</Label><Input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div>
  <div><Label>Email</Label><Input value={email} disabled/></div>
  <div className="grid gap-4 sm:grid-cols-2"><div><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={e=>setForm({...form,date_of_birth:e.target.value})}/></div><div><Label>State</Label><Input value={form.state} onChange={e=>setForm({...form,state:e.target.value})} placeholder="e.g. Madhya Pradesh"/></div></div>
  <div><Label>Highest qualification</Label><Input value={form.qualification} onChange={e=>setForm({...form,qualification:e.target.value})} placeholder="e.g. Graduate, 12th, Diploma"/></div>
  <div><Label>Discipline</Label><Input value={form.discipline} onChange={e=>setForm({...form,discipline:e.target.value})} placeholder="e.g. Civil Engineering"/></div>
  <div><Label>Graduation year</Label><Input type="number" min="1900" max="2100" value={form.graduation_year} onChange={e=>setForm({...form,graduation_year:e.target.value})}/></div>
  <Button disabled={saving}>{saving&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Save Profile</Button>{message&&<p className="text-sm text-muted-foreground">{message}</p>}
  </form></CardContent></Card></div></SiteShell>;
}