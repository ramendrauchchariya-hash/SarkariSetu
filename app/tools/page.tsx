import { BarChart3, Calculator, CalendarDays, ChevronRight, Percent, TrendingUp, Wallet } from 'lucide-react';
import { SiteShell } from '@/components/site/site-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tools = [
  { title: 'Age Calculator', description: 'Calculate age for government exam eligibility checks.', icon: CalendarDays, href: 'https://calculy-mu.vercel.app/age-calculator' },
  { title: 'CGPA to Percentage', description: 'Convert CGPA into percentage for application forms.', icon: Calculator, href: 'https://calculy-mu.vercel.app/cgpa-to-percentage' },
  { title: 'Percentage Calculator', description: 'Calculate percentages quickly for marks and results.', icon: Percent, href: 'https://calculy-mu.vercel.app/percentage-calculator' },
  { title: 'Rank Predictor', description: 'Use the calculator to estimate rank from expected marks.', icon: TrendingUp, href: 'https://calculy-mu.vercel.app/rank-predictor' },
  { title: 'Cut-off Analyser', description: 'Analyse scores against available cut-off data.', icon: BarChart3, href: 'https://calculy-mu.vercel.app/cut-off-analyser' },
  { title: 'Fee Calculator', description: 'Estimate application fees using the calculator.', icon: Wallet, href: 'https://calculy-mu.vercel.app/fee-calculator' },
];

export const metadata = { title: 'Tools — SarkariSetu', description: 'Useful calculators and exam preparation tools.' };

export default function ToolsPage() {
  return <SiteShell><div className="container-page py-8 sm:py-10">
    <p className="text-sm font-medium text-primary">Utilities</p>
    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Tools & Calculators</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Useful calculators for age, marks, rank, cut-offs and application fees.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map(({ title, description, icon: Icon, href }) => <Card key={href} className="transition-shadow hover:shadow-sm"><CardContent className="flex h-full flex-col p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-5 w-full"><a href={href} target="_blank" rel="noreferrer">Open Calculator <ChevronRight className="ml-1 h-4 w-4" /></a></Button>
      </CardContent></Card>)}
    </div>
    <p className="mt-6 text-xs text-muted-foreground">Calculators open on Calculy in a new tab. Use official recruitment notifications for final eligibility and fee decisions.</p>
  </div></SiteShell>;
}