'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { slugify } from '@/lib/slug';
import { computeRecruitmentStatus } from '@/lib/recruitment-status';
import {
  jobTypeOptions,
  locationTypeOptions,
  verificationStatusOptions,
  statusOverrideOptions,
  dateTypeOptions,
  eligibilityRuleTypeOptions,
  examModeOptions,
  vacancyCategoryOptions,
} from '@/lib/admin-config';
import {
  createJob,
  updateJob,
  publishJob,
  type JobFormData,
  type PostFormItem,
  type VacancyFormItem,
  type ImportantDateFormItem,
  type EligibilityFormItem,
  type FeeFormItem,
  type SelectionStepFormItem,
  type ExamPatternFormItem,
  type DocumentFormItem,
  type HowToApplyFormItem,
  type FaqFormItem,
} from '@/lib/admin-actions';
import { validateJobForm } from '@/lib/admin-validation';

interface Props {
  mode: 'create' | 'edit';
  jobId?: string;
  recruitment?: Record<string, unknown>;
  posts?: Array<Record<string, unknown> & { vacancies?: Array<Record<string, unknown>> }>;
  importantDates?: Array<Record<string, unknown>>;
  eligibilityRules?: Array<Record<string, unknown>>;
  applicationFees?: Array<Record<string, unknown>>;
  selectionProcess?: Array<Record<string, unknown>>;
  examPatterns?: Array<Record<string, unknown>>;
  documentsRequired?: Array<Record<string, unknown>>;
  howToApply?: Array<Record<string, unknown>>;
  faqs?: Array<Record<string, unknown>>;
  organizations: { id: string; name: string }[];
  categories: { id: string; name: string; slug: string }[];
  states: { id: string; name: string }[];
}

const EMPTY_FORM: JobFormData = {
  title: '',
  slug: '',
  organization_id: '',
  description: '',
  department: '',
  location_type: 'all-india',
  job_type: 'permanent',
  application_start: '',
  application_end: '',
  exam_date: '',
  posted_date: '',
  verification_status: 'unverified',
  official_notification_url: '',
  official_application_url: '',
  official_website_url: '',
  status_override: '',
  is_published: false,
  category_ids: [],
  posts: [],
  vacancies: [],
  important_dates: [],
  eligibility_rules: [],
  application_fees: [],
  selection_process: [],
  exam_patterns: [],
  documents_required: [],
  how_to_apply: [],
  faqs: [],
};

export function JobEditorClient(props: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Initialize form data from props or empty
  const [form, setForm] = useState<JobFormData>(() => {
    if (props.mode === 'edit' && props.recruitment) {
      const r = props.recruitment;
      const catIds = (r.recruitment_categories as Array<{ category_id: string }> | undefined)?.map((c) => c.category_id) ?? [];
      const posts: PostFormItem[] = (props.posts ?? []).map((p) => ({
        id: p.id as string,
        title: p.title as string ?? '',
        qualification: p.qualification as string ?? '',
        discipline: p.discipline as string ?? '',
        age_min: p.age_min?.toString() ?? '',
        age_max: p.age_max?.toString() ?? '',
        age_cutoff_date: p.age_cutoff_date as string ?? '',
        age_relaxation: p.age_relaxation as string ?? '',
        experience: p.experience as string ?? '',
        nationality_requirement: p.nationality_requirement as string ?? '',
        pay_level: p.pay_level as string ?? '',
        salary_min: p.salary_min?.toString() ?? '',
        salary_max: p.salary_max?.toString() ?? '',
        job_type: p.job_type as string ?? '',
      }));

      const vacancies: VacancyFormItem[] = [];
      (props.posts ?? []).forEach((p, idx) => {
        (p.vacancies ?? []).forEach((v) => {
          vacancies.push({
            post_index: idx,
            state_id: v.state_id as string ?? '',
            category_name: v.category_name as string ?? '',
            vacancy_count: v.vacancy_count?.toString() ?? '',
          });
        });
      });

      return {
        ...EMPTY_FORM,
        title: r.title as string ?? '',
        slug: r.slug as string ?? '',
        organization_id: r.organization_id as string ?? '',
        description: r.description as string ?? '',
        department: r.department as string ?? '',
        location_type: r.location_type as string ?? 'all-india',
        job_type: r.job_type as string ?? 'permanent',
        application_start: r.application_start as string ?? '',
        application_end: r.application_end as string ?? '',
        exam_date: r.exam_date as string ?? '',
        posted_date: r.posted_date as string ?? '',
        verification_status: r.verification_status as string ?? 'unverified',
        official_notification_url: r.official_notification_url as string ?? '',
        official_application_url: r.official_application_url as string ?? '',
        official_website_url: r.official_website_url as string ?? '',
        status_override: r.status_override as string ?? '',
        is_published: r.is_published as boolean ?? false,
        category_ids: catIds,
        posts,
        vacancies,
        important_dates: (props.importantDates ?? []).map((d) => ({
          id: d.id as string,
          date_type: d.date_type as string,
          date_value: d.date_value as string,
          label: d.label as string ?? '',
          description: d.description as string ?? '',
        })),
        eligibility_rules: (props.eligibilityRules ?? []).map((e) => ({
          id: e.id as string,
          post_index: posts.findIndex((p) => p.id === e.post_id),
          rule_type: e.rule_type as string,
          rule_value: e.rule_value as string,
          description: e.description as string ?? '',
        })),
        application_fees: (props.applicationFees ?? []).map((f) => ({
          id: f.id as string,
          category: f.category as string,
          amount: f.amount as string,
          payment_method: f.payment_method as string ?? '',
          notes: f.notes as string ?? '',
        })),
        selection_process: (props.selectionProcess ?? []).map((s) => ({
          id: s.id as string,
          step_number: s.step_number as number,
          title: s.title as string,
          description: s.description as string ?? '',
        })),
        exam_patterns: (props.examPatterns ?? []).map((e) => ({
          id: e.id as string,
          subject: e.subject as string,
          questions: e.questions?.toString() ?? '',
          marks: e.marks?.toString() ?? '',
          duration_minutes: e.duration_minutes?.toString() ?? '',
          negative_marking: e.negative_marking as string ?? '',
          mode: e.mode as string ?? '',
        })),
        documents_required: (props.documentsRequired ?? []).map((d) => ({
          id: d.id as string,
          document_name: d.document_name as string,
          description: d.description as string ?? '',
          is_required: d.is_required as boolean ?? true,
        })),
        how_to_apply: (props.howToApply ?? []).map((h) => ({
          id: h.id as string,
          step_number: h.step_number as number,
          title: h.title as string,
          description: h.description as string ?? '',
        })),
        faqs: (props.faqs ?? []).map((f) => ({
          id: f.id as string,
          question: f.question as string,
          answer: f.answer as string,
          display_order: f.display_order as number,
        })),
      };
    }
    return EMPTY_FORM;
  });

  const update = <K extends keyof JobFormData>(key: K, value: JobFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const computedStatus = computeRecruitmentStatus({
    application_start: form.application_start || null,
    application_end: form.application_end || null,
    status_override: (form.status_override || null) as import('@/lib/database-types').RecruitmentStatus | null,
  });

  // ─── Save handlers ─────────────────────────────────────────

  const handleSaveDraft = () => {
    setErrors([]);
    const validation = validateJobForm(form, false);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before saving.');
      return;
    }

    startTransition(async () => {
      if (props.mode === 'create') {
        const result = await createJob(form);
        if (result.success && result.id) {
          toast.success('Draft saved successfully.');
          router.push('/admin/jobs');
        } else {
          toast.error(result.error || 'Failed to save draft.');
          setErrors([result.error || 'Failed to save.']);
        }
      } else if (props.mode === 'edit' && props.jobId) {
        const result = await updateJob(props.jobId, form);
        if (result.success) {
          toast.success('Job saved successfully.');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to save.');
          setErrors([result.error || 'Failed to save.']);
        }
      }
    });
  };

  const handleSaveAndPreview = () => {
    setErrors([]);
    const validation = validateJobForm(form, false);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before saving.');
      return;
    }

    startTransition(async () => {
      if (props.mode === 'create') {
        const result = await createJob(form);
        if (result.success && result.id) {
          toast.success('Draft saved. Redirecting to preview...');
          router.push(`/admin/jobs/${result.id}/preview`);
        } else {
          toast.error(result.error || 'Failed to save draft.');
          setErrors([result.error || 'Failed to save.']);
        }
      } else if (props.mode === 'edit' && props.jobId) {
        const result = await updateJob(props.jobId, form);
        if (result.success) {
          toast.success('Saved. Redirecting to preview...');
          router.push(`/admin/jobs/${props.jobId}/preview`);
        } else {
          toast.error(result.error || 'Failed to save.');
          setErrors([result.error || 'Failed to save.']);
        }
      }
    });
  };

  const handlePublish = () => {
    setErrors([]);
    const validation = validateJobForm(form, true);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Cannot publish. Please fix the following issues.');
      setShowPublishConfirm(false);
      return;
    }

    if (props.mode === 'edit' && props.jobId) {
      startTransition(async () => {
        // First save, then publish
        const saveResult = await updateJob(props.jobId!, form);
        if (!saveResult.success) {
          toast.error(saveResult.error || 'Failed to save before publishing.');
          setErrors([saveResult.error || 'Failed to save.']);
          setShowPublishConfirm(false);
          return;
        }
        const pubResult = await publishJob(props.jobId!);
        if (pubResult.success) {
          toast.success('Job published successfully!');
          setShowPublishConfirm(false);
          router.push('/admin/jobs');
        } else {
          toast.error(pubResult.error || 'Failed to publish.');
          setErrors([pubResult.error || 'Failed to publish.']);
        }
      });
    }
  };

  // ─── Auto-slug on title change (create mode only) ──────────

  const handleTitleChange = (value: string) => {
    update('title', value);
    if (props.mode === 'create') {
      update('slug', slugify(value));
    }
  };

  // ─── Repeatable item helpers ──────────────────────────────

  const addPost = () => {
    setForm((prev) => ({
      ...prev,
      posts: [...prev.posts, {
        title: '', qualification: '', discipline: '', age_min: '', age_max: '',
        age_cutoff_date: '', age_relaxation: '', experience: '',
        nationality_requirement: '', pay_level: '', salary_min: '', salary_max: '',
        job_type: '',
      }],
    }));
  };

  const removePost = (index: number) => {
    setForm((prev) => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index),
      vacancies: prev.vacancies.filter((v) => v.post_index !== index).map((v) => ({
        ...v,
        post_index: v.post_index > index ? v.post_index - 1 : v.post_index,
      })),
    }));
  };

  const addVacancy = () => {
    if (form.posts.length === 0) {
      toast.error('Please add a post first before adding vacancies.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      vacancies: [...prev.vacancies, {
        post_index: 0, state_id: '', category_name: 'UR', vacancy_count: '',
      }],
    }));
  };

  const addImportantDate = () => {
    setForm((prev) => ({
      ...prev,
      important_dates: [...prev.important_dates, { date_type: 'other', date_value: '', label: '', description: '' }],
    }));
  };

  const addEligibility = () => {
    setForm((prev) => ({
      ...prev,
      eligibility_rules: [...prev.eligibility_rules, { post_index: -1, rule_type: 'education', rule_value: '', description: '' }],
    }));
  };

  const addFee = () => {
    setForm((prev) => ({
      ...prev,
      application_fees: [...prev.application_fees, { category: '', amount: '', payment_method: '', notes: '' }],
    }));
  };

  const addSelectionStep = () => {
    setForm((prev) => ({
      ...prev,
      selection_process: [...prev.selection_process, {
        step_number: prev.selection_process.length + 1, title: '', description: '',
      }],
    }));
  };

  const addExamPattern = () => {
    setForm((prev) => ({
      ...prev,
      exam_patterns: [...prev.exam_patterns, {
        subject: '', questions: '', marks: '', duration_minutes: '', negative_marking: '', mode: '',
      }],
    }));
  };

  const addDocument = () => {
    setForm((prev) => ({
      ...prev,
      documents_required: [...prev.documents_required, { document_name: '', description: '', is_required: true }],
    }));
  };

  const addHowToApply = () => {
    setForm((prev) => ({
      ...prev,
      how_to_apply: [...prev.how_to_apply, {
        step_number: prev.how_to_apply.length + 1, title: '', description: '',
      }],
    }));
  };

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '', display_order: prev.faqs.length + 1 }],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Validation errors */}
      {errors.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Please fix the following:</p>
              <ul className="mt-1 list-inside list-disc text-sm text-destructive">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Action bar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <Badge variant={form.is_published ? 'success' : 'secondary'}>
            {form.is_published ? 'Published' : 'Draft'}
          </Badge>
          <Badge variant="info">Auto: {computedStatus.replace('-', ' ')}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={handleSaveDraft} disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Draft
        </Button>
        <Button size="sm" variant="outline" onClick={handleSaveAndPreview} disabled={isPending} className="gap-2">
          <Eye className="h-4 w-4" />
          Save & Preview
        </Button>
        {props.mode === 'edit' && (
          <Button size="sm" onClick={() => setShowPublishConfirm(true)} disabled={isPending} className="gap-2">
            <Send className="h-4 w-4" />
            Publish
          </Button>
        )}
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="dates">Dates</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="status">Status & Verification</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="vacancies">Vacancies</TabsTrigger>
          <TabsTrigger value="content">Content Sections</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g., SSC CGL Recruitment 2026" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} placeholder="auto-generated from title" />
                  <p className="text-xs text-muted-foreground">This becomes the URL: /jobs/{form.slug || 'your-slug'}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org">Organization *</Label>
                  <Select value={form.organization_id} onValueChange={(v) => update('organization_id', v)}>
                    <SelectTrigger id="org"><SelectValue placeholder="Select organization" /></SelectTrigger>
                    <SelectContent>
                      {props.organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Input id="dept" value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="e.g., ssc, railway, banking" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loc">Location Type</Label>
                  <Select value={form.location_type} onValueChange={(v) => update('location_type', v)}>
                    <SelectTrigger id="loc"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locationTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jtype">Job Type</Label>
                  <Select value={form.job_type} onValueChange={(v) => update('job_type', v)}>
                    <SelectTrigger id="jtype"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {jobTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Brief description of the recruitment..." rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dates */}
        <TabsContent value="dates">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Important Dates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="app_start">Application Start</Label>
                  <Input id="app_start" type="date" value={form.application_start} onChange={(e) => update('application_start', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app_end">Application End</Label>
                  <Input id="app_end" type="date" value={form.application_end} onChange={(e) => update('application_end', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input id="exam_date" type="date" value={form.exam_date} onChange={(e) => update('exam_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posted">Posted Date</Label>
                  <Input id="posted" type="date" value={form.posted_date} onChange={(e) => update('posted_date', e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Additional Important Dates</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addImportantDate} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Date
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.important_dates.map((d, i) => (
                    <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Date Type</Label>
                        <Select value={d.date_type} onValueChange={(v) => {
                          const items = [...form.important_dates];
                          items[i] = { ...items[i], date_type: v };
                          update('important_dates', items);
                        }}>
                          <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {dateTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" className="h-9 w-[160px]" value={d.date_value} onChange={(e) => {
                          const items = [...form.important_dates];
                          items[i] = { ...items[i], date_value: e.target.value };
                          update('important_dates', items);
                        }} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Label (optional)</Label>
                        <Input className="h-9 w-[180px]" value={d.label} onChange={(e) => {
                          const items = [...form.important_dates];
                          items[i] = { ...items[i], label: e.target.value };
                          update('important_dates', items);
                        }} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                        update('important_dates', form.important_dates.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {form.important_dates.length === 0 && (
                    <p className="text-sm text-muted-foreground">No additional dates added.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links */}
        <TabsContent value="links">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Official Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notif_url">Official Notification URL</Label>
                <Input id="notif_url" type="url" value={form.official_notification_url} onChange={(e) => update('official_notification_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_url">Official Application URL</Label>
                <Input id="app_url" type="url" value={form.official_application_url} onChange={(e) => update('official_application_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="web_url">Official Website URL</Label>
                <Input id="web_url" type="url" value={form.official_website_url} onChange={(e) => update('official_website_url', e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status & Verification */}
        <TabsContent value="status">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Status & Verification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Automatic Status</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The status is automatically computed from application dates: <Badge variant="info" className="ml-1">{computedStatus.replace('-', ' ')}</Badge>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="override">Status Override</Label>
                <Select value={form.status_override || 'none'} onValueChange={(v) => update('status_override', v === 'none' ? '' : v)}>
                  <SelectTrigger id="override"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOverrideOptions.map((o) => <SelectItem key={o.value || 'none'} value={o.value || 'none'}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Use this to manually override the automatic status if needed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vstatus">Verification Status</Label>
                <Select value={form.verification_status} onValueChange={(v) => update('verification_status', v)}>
                  <SelectTrigger id="vstatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {verificationStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="flex items-start gap-1 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  You must explicitly set this to "Verified" — it is never set automatically.
                </p>
              </div>
              <div className="rounded-md border border-info/30 bg-info/5 p-3 text-sm">
                <p><strong>Published/Draft:</strong> {form.is_published ? 'Currently Published' : 'Currently Draft'}</p>
                <p className="text-xs text-muted-foreground mt-1">Use the Publish button in the action bar to change this.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Qualification Categories</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">Select the qualification categories this job is relevant to.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {props.categories.map((cat) => {
                  const checked = form.category_ids.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            update('category_ids', [...form.category_ids, cat.id]);
                          } else {
                            update('category_ids', form.category_ids.filter((id) => id !== cat.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-input"
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts */}
        <TabsContent value="posts">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Posts / Positions</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addPost} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Post
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.posts.length === 0 && (
                <p className="text-sm text-muted-foreground">No posts added yet. Add a post to specify positions, qualifications, age limits, and salary.</p>
              )}
              {form.posts.map((post, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Post {i + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePost(i)} className="gap-1 text-destructive">
                      <Trash2 className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Post Title</Label>
                      <Input value={post.title} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], title: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., Assistant Section Officer" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qualification</Label>
                      <Input value={post.qualification} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], qualification: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., Graduate" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discipline</Label>
                      <Input value={post.discipline} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], discipline: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., Any Discipline" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Job Type</Label>
                      <Select value={post.job_type || 'none'} onValueChange={(v) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], job_type: v === 'none' ? '' : v };
                        update('posts', items);
                      }}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Same as recruitment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Same as recruitment</SelectItem>
                          {jobTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Min Age</Label>
                      <Input type="number" value={post.age_min} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], age_min: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., 18" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Age</Label>
                      <Input type="number" value={post.age_max} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], age_max: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., 32" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Age Cutoff Date</Label>
                      <Input type="date" value={post.age_cutoff_date} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], age_cutoff_date: e.target.value };
                        update('posts', items);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pay Level</Label>
                      <Input value={post.pay_level} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], pay_level: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., Level 4 (7th CPC)" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Min Salary</Label>
                      <Input type="number" value={post.salary_min} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], salary_min: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., 25500" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Salary</Label>
                      <Input type="number" value={post.salary_max} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], salary_max: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., 81100" />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Age Relaxation</Label>
                      <Textarea className="text-sm" rows={2} value={post.age_relaxation} onChange={(e) => {
                        const items = [...form.posts];
                        items[i] = { ...items[i], age_relaxation: e.target.value };
                        update('posts', items);
                      }} placeholder="e.g., OBC: 3 years, SC/ST: 5 years" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Experience</Label>
                        <Input value={post.experience} onChange={(e) => {
                          const items = [...form.posts];
                          items[i] = { ...items[i], experience: e.target.value };
                          update('posts', items);
                        }} placeholder="e.g., Freshers eligible" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nationality</Label>
                        <Input value={post.nationality_requirement} onChange={(e) => {
                          const items = [...form.posts];
                          items[i] = { ...items[i], nationality_requirement: e.target.value };
                          update('posts', items);
                        }} placeholder="e.g., Citizen of India" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vacancies */}
        <TabsContent value="vacancies">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Vacancy Breakdown</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVacancy} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Vacancy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.posts.length === 0 && (
                <p className="text-sm text-warning">Please add posts first before adding vacancies.</p>
              )}
              {form.vacancies.length === 0 && form.posts.length > 0 && (
                <p className="text-sm text-muted-foreground">No vacancies added yet.</p>
              )}
              {form.vacancies.map((v, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Post</Label>
                    <Select value={String(v.post_index)} onValueChange={(val) => {
                      const items = [...form.vacancies];
                      items[i] = { ...items[i], post_index: parseInt(val, 10) };
                      update('vacancies', items);
                    }}>
                      <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">All Posts</SelectItem>
                        {form.posts.map((p, idx) => <SelectItem key={idx} value={String(idx)}>{p.title || `Post ${idx + 1}`}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <Select value={v.state_id || 'none'} onValueChange={(val) => {
                      const items = [...form.vacancies];
                      items[i] = { ...items[i], state_id: val === 'none' ? '' : val };
                      update('vacancies', items);
                    }}>
                      <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="All India" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All India</SelectItem>
                        {props.states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={v.category_name} onValueChange={(val) => {
                      const items = [...form.vacancies];
                      items[i] = { ...items[i], category_name: val };
                      update('vacancies', items);
                    }}>
                      <SelectTrigger className="h-9 w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Categories">All Categories</SelectItem>
                        {vacancyCategoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vacancy Count</Label>
                    <Input type="number" className="h-9 w-[120px]" value={v.vacancy_count} onChange={(e) => {
                      const items = [...form.vacancies];
                      items[i] = { ...items[i], vacancy_count: e.target.value };
                      update('vacancies', items);
                    }} placeholder="e.g., 100" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                    update('vacancies', form.vacancies.filter((_, idx) => idx !== i));
                  }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Sections (fees, selection, exam pattern, docs, how-to, FAQs, eligibility) */}
        <TabsContent value="content">
          <div className="space-y-4">
            {/* Application Fees */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Application Fees</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addFee} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Fee
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.application_fees.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Input className="h-9 w-[180px]" value={f.category} onChange={(e) => {
                        const items = [...form.application_fees];
                        items[i] = { ...items[i], category: e.target.value };
                        update('application_fees', items);
                      }} placeholder="e.g., General / OBC" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input className="h-9 w-[120px]" value={f.amount} onChange={(e) => {
                        const items = [...form.application_fees];
                        items[i] = { ...items[i], amount: e.target.value };
                        update('application_fees', items);
                      }} placeholder="e.g., ₹ 100" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Payment Method</Label>
                      <Input className="h-9 w-[200px]" value={f.payment_method} onChange={(e) => {
                        const items = [...form.application_fees];
                        items[i] = { ...items[i], payment_method: e.target.value };
                        update('application_fees', items);
                      }} placeholder="e.g., Online / SBI Challan" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('application_fees', form.application_fees.filter((_, idx) => idx !== i));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.application_fees.length === 0 && <p className="text-sm text-muted-foreground">No fees added.</p>}
              </CardContent>
            </Card>

            {/* Selection Process */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Selection Process</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addSelectionStep} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.selection_process.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{s.step_number}</span>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input value={s.title} onChange={(e) => {
                        const items = [...form.selection_process];
                        items[i] = { ...items[i], title: e.target.value, step_number: i + 1 };
                        update('selection_process', items);
                      }} placeholder="e.g., Computer Based Examination (Tier-I)" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('selection_process', form.selection_process.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step_number: idx + 1 })));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.selection_process.length === 0 && <p className="text-sm text-muted-foreground">No selection steps added.</p>}
              </CardContent>
            </Card>

            {/* Exam Pattern */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Exam Pattern</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addExamPattern} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Subject
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.exam_patterns.map((e, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Subject</Label>
                      <Input value={e.subject} onChange={(ev) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], subject: ev.target.value };
                        update('exam_patterns', items);
                      }} placeholder="e.g., General Intelligence & Reasoning" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Questions</Label>
                      <Input type="number" className="h-9 w-[100px]" value={e.questions} onChange={(ev) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], questions: ev.target.value };
                        update('exam_patterns', items);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Marks</Label>
                      <Input type="number" className="h-9 w-[100px]" value={e.marks} onChange={(ev) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], marks: ev.target.value };
                        update('exam_patterns', items);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input type="number" className="h-9 w-[100px]" value={e.duration_minutes} onChange={(ev) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], duration_minutes: ev.target.value };
                        update('exam_patterns', items);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Negative Marking</Label>
                      <Input className="h-9 w-[160px]" value={e.negative_marking} onChange={(ev) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], negative_marking: ev.target.value };
                        update('exam_patterns', items);
                      }} placeholder="e.g., 0.50 per wrong" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Mode</Label>
                      <Select value={e.mode || 'none'} onValueChange={(val) => {
                        const items = [...form.exam_patterns];
                        items[i] = { ...items[i], mode: val === 'none' ? '' : val };
                        update('exam_patterns', items);
                      }}>
                        <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          {examModeOptions.filter((o) => o.value).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('exam_patterns', form.exam_patterns.filter((_, idx) => idx !== i));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.exam_patterns.length === 0 && <p className="text-sm text-muted-foreground">No exam pattern subjects added.</p>}
              </CardContent>
            </Card>

            {/* Documents Required */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Documents Required</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addDocument} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.documents_required.map((d, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Document Name</Label>
                      <Input value={d.document_name} onChange={(e) => {
                        const items = [...form.documents_required];
                        items[i] = { ...items[i], document_name: e.target.value };
                        update('documents_required', items);
                      }} placeholder="e.g., 10th / Matriculation certificate" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={d.is_required} onChange={(e) => {
                        const items = [...form.documents_required];
                        items[i] = { ...items[i], is_required: e.target.checked };
                        update('documents_required', items);
                      }} className="h-4 w-4 rounded border-input" />
                      Required
                    </label>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('documents_required', form.documents_required.filter((_, idx) => idx !== i));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.documents_required.length === 0 && <p className="text-sm text-muted-foreground">No documents added.</p>}
              </CardContent>
            </Card>

            {/* How To Apply */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">How to Apply</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addHowToApply} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.how_to_apply.map((h, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{h.step_number}</span>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Step Title</Label>
                      <Input value={h.title} onChange={(e) => {
                        const items = [...form.how_to_apply];
                        items[i] = { ...items[i], title: e.target.value, step_number: i + 1 };
                        update('how_to_apply', items);
                      }} placeholder="e.g., Visit the official SSC application website" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('how_to_apply', form.how_to_apply.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step_number: idx + 1 })));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.how_to_apply.length === 0 && <p className="text-sm text-muted-foreground">No application steps added.</p>}
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addFaq} className="gap-1">
                    <Plus className="h-3 w-3" /> Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.faqs.map((f, i) => (
                  <div key={i} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">FAQ {i + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => {
                        update('faqs', form.faqs.filter((_, idx) => idx !== i).map((f, idx) => ({ ...f, display_order: idx + 1 })));
                      }} className="gap-1 text-destructive">
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Question</Label>
                      <Input value={f.question} onChange={(e) => {
                        const items = [...form.faqs];
                        items[i] = { ...items[i], question: e.target.value, display_order: i + 1 };
                        update('faqs', items);
                      }} placeholder="e.g., Who can apply for this exam?" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Answer</Label>
                      <Textarea rows={2} value={f.answer} onChange={(e) => {
                        const items = [...form.faqs];
                        items[i] = { ...items[i], answer: e.target.value };
                        update('faqs', items);
                      }} placeholder="Enter the answer..." />
                    </div>
                  </div>
                ))}
                {form.faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs added.</p>}
              </CardContent>
            </Card>

            {/* Eligibility Rules */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Eligibility Rules</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addEligibility} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.eligibility_rules.map((e, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Rule Type</Label>
                      <Select value={e.rule_type} onValueChange={(v) => {
                        const items = [...form.eligibility_rules];
                        items[i] = { ...items[i], rule_type: v };
                        update('eligibility_rules', items);
                      }}>
                        <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {eligibilityRuleTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Rule Value</Label>
                      <Input value={e.rule_value} onChange={(ev) => {
                        const items = [...form.eligibility_rules];
                        items[i] = { ...items[i], rule_value: ev.target.value };
                        update('eligibility_rules', items);
                      }} placeholder="e.g., Graduate from a recognized university" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      update('eligibility_rules', form.eligibility_rules.filter((_, idx) => idx !== i));
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.eligibility_rules.length === 0 && <p className="text-sm text-muted-foreground">No eligibility rules added.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Publish confirmation dialog */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make "{form.title}" visible on the public /jobs page. The job must have at least a description, application start/end dates, and be at least "Pending Review" verification status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publish Job</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
