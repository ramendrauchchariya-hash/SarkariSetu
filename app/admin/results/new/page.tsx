import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { ResultForm } from '@/components/admin/result-form';

export const dynamic='force-dynamic';
export const metadata={title:'Admin — Add Result'};

export default async function Page({params}:{params:{id?:string}}){
 await requireAdmin();
 const {data:organizations}=await supabaseAdmin.from('organizations').select('id,name').eq('is_active',true).order('name');
 
 return <AdminShell title="Add Result" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Results',href:'/admin/results'},{label:'Add Result'}]}><ResultForm  organizations={organizations??[]}/></AdminShell>;
}