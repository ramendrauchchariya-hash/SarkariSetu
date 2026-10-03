import type { NavItem } from './types';

export const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Exams', href: '/exams' },
  { label: 'Results', href: '/results' },
  { label: 'Admit Cards', href: '/admit-cards' },
  { label: 'Answer Keys', href: '/answer-keys' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Tools', href: '/tools' },
];

export const AUTHENTICATED_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Saved Jobs', href: '/dashboard/saved-jobs' },
  { label: 'My Applications', href: '/dashboard/applications' },
  { label: 'Notifications', href: '/dashboard/notifications' },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Dashboard', href: '/admin' },
  { label: 'Jobs', href: '/admin/jobs' },
  { label: 'Results', href: '/admin/results' },
  { label: 'Admit Cards', href: '/admin/admit-cards' },
  { label: 'Answer Keys', href: '/admin/answer-keys' },
  { label: 'Organizations', href: '/admin/organizations' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'Settings', href: '/admin/settings' },
];

export const ALL_NAV_GROUPS = [
  { title: 'Public', items: PUBLIC_NAV },
  { title: 'Account', items: AUTHENTICATED_NAV },
  { title: 'Admin', items: ADMIN_NAV },
];
