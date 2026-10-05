import { NotificationSettings } from '@/components/site/notification-settings';
import { SiteShell } from '@/components/site/site-shell';

export const metadata = { title: 'Job Alerts & Notifications' };

export default function NotificationsPage() {
  return <SiteShell><div className="container-page py-8">
    <div className="mb-8"><p className="text-sm font-medium text-primary">My Account</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Job Alerts & Notifications</h1><p className="mt-2 max-w-2xl text-muted-foreground">Set preferences for government jobs you want to track. You can update or remove an alert at any time.</p></div>
    <NotificationSettings />
  </div></SiteShell>;
}