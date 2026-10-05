'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ChevronDown, Shield, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PUBLIC_NAV, AUTHENTICATED_NAV, ADMIN_NAV } from '@/lib/navigation';
import { supabase } from '@/lib/supabase-client';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchBar } from './search-bar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [userEmail,setUserEmail]=useState<string|null>(null);

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setUserEmail(data.user?.email??null));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUserEmail(session?.user?.email??null));
    return ()=>subscription.unsubscribe();
  },[]);

  const isActive=(href:string)=>href==='/'?pathname==='/':pathname.startsWith(href);
  const accountItems=[{label:'Dashboard',href:'/dashboard'},{label:'Saved Jobs',href:'/dashboard/saved-jobs'},{label:'My Applications',href:'/dashboard/applications'},{label:'Notifications',href:'/dashboard/notifications'},{label:'Profile & Settings',href:'/dashboard/profile'}];

  async function signOut(){await supabase.auth.signOut();router.push('/');router.refresh();}

  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div className="hidden border-b bg-primary py-1.5 text-primary-foreground md:block"><div className="container-page flex items-center justify-between text-xs"><p className="font-medium">An independent information platform — not affiliated with any government body.</p><div className="flex items-center gap-4"><Link href="/about" className="hover:underline">About</Link><Link href="/contact" className="hover:underline">Contact</Link><Link href="/admin" className="inline-flex items-center gap-1 hover:underline"><Shield className="h-3 w-3"/>Admin</Link></div></div></div>
    <div className="container-page flex h-16 items-center justify-between gap-4">
      <div className="flex items-center gap-3"><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu"><Menu className="h-5 w-5"/></Button></SheetTrigger><SheetContent side="left" className="w-[300px] sm:w-[340px]"><SheetHeader><SheetTitle asChild><div className="flex items-center pr-6"><Logo/></div></SheetTitle></SheetHeader><div className="mt-2 flex h-full flex-col gap-1 overflow-y-auto pr-2"><nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">{PUBLIC_NAV.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('rounded-md px-3 py-2.5 text-sm font-medium',isActive(item.href)?'bg-primary/10 text-primary':'text-foreground hover:bg-muted')}>{item.label}</Link>)}</nav><div className="my-2 h-px bg-border"/><p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</p><nav className="flex flex-col gap-0.5">{accountItems.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"><User className="h-4 w-4 text-muted-foreground"/>{item.label}</Link>)}</nav><div className="mt-auto space-y-2 border-t pt-4">{userEmail?<Button variant="outline" className="w-full" onClick={signOut}><LogOut className="mr-2 h-4 w-4"/>Sign Out</Button>:<><Button asChild className="w-full"><Link href="/auth/login" onClick={()=>setMobileOpen(false)}>Sign In</Link></Button><Button asChild variant="outline" className="w-full"><Link href="/auth/register" onClick={()=>setMobileOpen(false)}>Create Account</Link></Button></>}</div></div></SheetContent></Sheet><Logo/></div>
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">{PUBLIC_NAV.map(item=><Link key={item.href} href={item.href} className={cn('rounded-md px-3 py-2 text-sm font-medium',isActive(item.href)?'bg-primary/10 text-primary':'text-foreground/80 hover:bg-muted hover:text-foreground')}>{item.label}</Link>)}</nav>
      <div className="flex items-center gap-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Search" className="hidden sm:inline-flex"><Search className="h-5 w-5"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-[min(90vw,420px)] p-3"><SearchBar/></DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="hidden items-center gap-1.5 md:inline-flex"><User className="h-4 w-4"/><span className="max-w-[140px] truncate text-sm">{userEmail?userEmail.split('@')[0]:'Account'}</span><ChevronDown className="h-3.5 w-3.5 text-muted-foreground"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>{userEmail??'My Account'}</DropdownMenuLabel><DropdownMenuSeparator/>{accountItems.map(item=><DropdownMenuItem key={item.href} asChild><Link href={item.href}>{item.label}</Link></DropdownMenuItem>)}{userEmail?<><DropdownMenuSeparator/><DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4"/>Sign Out</DropdownMenuItem></>:<><DropdownMenuSeparator/><DropdownMenuItem asChild><Link href="/auth/login" className="font-semibold text-primary">Sign In</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/register">Create Account</Link></DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
        {!userEmail&&<Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/auth/login">Login</Link></Button>}
        {!userEmail&&<Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/auth/register">Get Started</Link></Button>}
        {userEmail&&<Button asChild size="sm" variant="outline" className="hidden sm:inline-flex"><Link href="/dashboard/profile"><Settings className="mr-2 h-4 w-4"/>Profile</Link></Button>}
      </div>
    </div>
  </header>;
}