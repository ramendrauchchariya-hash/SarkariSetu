import { SiteShell } from '@/components/site/site-shell';
import { Mail, MessageSquare, Clock } from 'lucide-react';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="container-page py-14">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-4 text-muted-foreground">
            Have a question, suggestion or found an error? We would love to
            hear from you.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <Mail className="mx-auto h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">Email</h2>
            <a href="mailto:hello@sarkarisetu.in" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
              hello@sarkarisetu.in
            </a>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <MessageSquare className="mx-auto h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">Feedback</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use the feedback option in the footer</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <Clock className="mx-auto h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">Response Time</h2>
            <p className="mt-1 text-sm text-muted-foreground">We reply within 48 hours</p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
