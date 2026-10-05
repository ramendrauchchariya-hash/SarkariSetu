import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ExternalLink } from 'lucide-react';
import { ResultActions } from '@/components/admin/result-actions';
import { formatDate } from '@/lib/format';

export const dynamic='force-dynamic';
export const metadata={title:'Admin — Results'};

export default async function AdminResultsPage(){
 await requireAdmin();
 const {data}=await supabaseAdmin.from('results').select('id,title,slug,result_type,result_date,is_published,archived_at,official_result_url,organization:organizations(name)').order('updated_at',{ascending:false});
 const rows=(data??[]).map(r=>{const o=Array.isArray(r.organization)?r.organization[0]:r.organization;return {...r,organizationName:o?.name??'—'}});
 return <AdminShell title="Manage Results" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Results'}]} actions={<Button asChild size="sm"><Link href="/admin/results/new"><Plus className="mr-2 h-4 w-4"/>Add Result</Link></Button>}>
  <div className="space-y-4"><p className="text-sm text-muted-foreground">{rows.length} result records</p>
   {rows.length===0?<Card><CardContent className="p-10 text-center"><p className="font-semibold">No result records yet.</p><p className="mt-1 text-sm text-muted-foreground">Create a result after verifying the official result source.</p></CardContent></Card>:
   <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground"><th className="px-4 py-3">Result</th><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{rows.map(r=><tr key={r.id} className="hover:bg-muted/20"><td className="px-4 py-3"><Link href={'/admin/results/'+r.id+'/edit'} className="font-medium hover:text-primary">{r.title}</Link><p className="text-xs text-muted-foreground">{r.result_type.replace(/-/g,' ')}</p></td><td className="px-4 py-3 text-muted-foreground">{r.organizationName}</td><td className="px-4 py-3 text-muted-foreground">{r.result_date?formatDate(r.result_date):'—'}</td><td className="px-4 py-3">{r.archived_at?<Badge variant="outline">Archived</Badge>:r.is_published?<Badge variant="success">Published</Badge>:<Badge variant="secondary">Draft</Badge>}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Link href={'/results/'+r.slug} target="_blank" className="rounded p-2 text-muted-foreground hover:bg-muted" title="View"><ExternalLink className="h-4 w-4"/></Link><ResultActions id={r.id} title={r.title} published={r.is_published} archived={!!r.archived_at}/></div></td></tr>)}</tbody></table></div>}
  </div>
 </AdminShell>;
}