'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Archive,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  FileBarChart,
  GraduationCap,
  Bell,
  Building2,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
import { AdminSessionSync } from './admin-session-sync';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Jobs', href: '/admin/jobs', icon: FileText },
  { label: 'Results', href: '/admin/results', icon: FileBarChart, disabled: true },
  { label: 'Admit Cards', href: '/admin/admit-cards', icon: Clock, disabled: true },
  { label: 'Answer Keys', href: '/admin/answer-keys', icon: FileBarChart, disabled: true },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2, disabled: true },
  { label: 'Categories', href: '/admin/categories', icon: GraduationCap, disabled: true },
  { label: 'Users', href: '/admin/users', icon: Users, disabled: true },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, disabled: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, disabled: true },
];

export function AdminShell({
  children,
  title,
  breadcrumbs,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch('/api/admin/session', { method: 'DELETE', credentials: 'same-origin' });
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="font-display text-lg font-bold">SarkariSetu</span>
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                title="Coming Soon"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSessionSync />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card lg:hidden">
            <button
              className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground/50">/</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : (
              <h1 className="font-display text-lg font-bold">{title}</h1>
            )}
          </div>

          {actions}
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
