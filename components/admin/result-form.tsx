'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createResult, updateResult, type ResultFormData } from '@/lib/admin-actions';

export function ResultForm({ initial, organizations, id }: { initial?: ResultFormData; organizations:{id:string;name:string}[]; id?:string }) {
 const router=useRouter(); const [data,setData]=useState<ResultFormData>(initial??{title:'',slug:'',organization_id:'',recruitment_id:'',result_type:'result',result_date:'',description:'',official_result_url:'',official_website_url:''}); const [saving,setSaving]=useState(false); const [error,setError]=useState('');
 const set=(key:keyof ResultFormData,value:string)=>setData({...data,[key]:value});
 async function submit(e:React.FormEvent){e.preventDefault();setSaving(true);setError('');const r=id?await updateResult(id,data):await createResult(data);setSaving(false);if(!r.success){setError(r.error??'Unable to save result.');return;}router.push('/admin/results');router.refresh();}
 return <form onSubmit={submit} className="max-w-3xl space-y-5">
  {error&&<div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
  <div><Label>Result title</Label><Input required value={data.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. SSC CHSL 2026 Tier-I Result"/></div>
  <div><Label>Slug</Label><Input required value={data.slug} onChange={e=>set('slug',e.target.value)} placeholder="ssc-chsl-2026-tier-1-result"/></div>
  <div><Label>Organization</Label><select className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={data.organization_id} onChange={e=>set('organization_id',e.target.value)}><option value="">Select organization</option>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
  <div className="grid gap-4 sm:grid-cols-2"><div><Label>Result type</Label><Input required value={data.result_type} onChange={e=>set('result_type',e.target.value)} placeholder="result / merit-list / cutoff / scorecard"/></div><div><Label>Result date</Label><Input type="date" value={data.result_date} onChange={e=>set('result_date',e.target.value)}/></div></div>
  <div><Label>Description</Label><Textarea value={data.description} onChange={e=>set('description',e.target.value)} rows={5} placeholder="Brief, factual summary of the result."/></div>
  <div><Label>Official result URL</Label><Input type="url" required value={data.official_result_url} onChange={e=>set('official_result_url',e.target.value)} placeholder="https://official-site.gov.in/..."/></div>
  <div><Label>Official website URL</Label><Input type="url" value={data.official_website_url} onChange={e=>set('official_website_url',e.target.value)} placeholder="https://official-site.gov.in"/></div>
  <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving?'Saving…':id?'Save Changes':'Save Draft'}</Button><Button type="button" variant="outline" onClick={()=>router.push('/admin/results')}>Cancel</Button></div>
 </form>;
}