import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { AdminShell } from '@/components/admin/admin-shell';
import { ResultForm } from '@/components/admin/result-form';

export const dynamic='force-dynamic';
export const metadata={title:'Admin — Edit Result'};

export default async function Page({params}:{params:{id?:string}}){
 await requireAdmin();
 const {data:organizations}=await supabaseAdmin.from('organizations').select('id,name').eq('is_active',true).order('name');
 const {data}=await supabaseAdmin.from('results').select('title,slug,organization_id,recruitment_id,result_type,result_date,description,official_result_url,official_website_url').eq('id',params.id).single(); if(!data)return null;
 return <AdminShell title="Edit Result" breadcrumbs={[{label:'Admin',href:'/admin'},{label:'Results',href:'/admin/results'},{label:'Edit Result'}]}><ResultForm id={params.id} initial={data} organizations={organizations??[]}/></AdminShell>;
}