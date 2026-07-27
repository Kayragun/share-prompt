'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LocaleSwitcher from './LocaleSwitcher';
import { LogoMark } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  locale: string;
  user: { id: string; email: string } | null;
  profile: { username: string; avatar_url: string | null } | null;
  messages: {
    home: string; categories: string; newPrompt: string; starred: string;
    login: string; register: string; logout: string; profile: string; faq: string; settings: string;
  };
};

export default function NavbarClient({ locale, user, profile, messages }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  const base = `/${locale}`;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 max-w-6xl h-14 flex items-center justify-between gap-4 relative">
        {/* Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href={base} className="group flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <LogoMark className="h-7 w-7 transition-opacity duration-300 group-hover:opacity-80" />
            <span className="text-foreground">
              Share<span className="text-muted-foreground">Prompt</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href={`${base}/categories`}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {messages.categories}
            </Link>
            {user && (
              <Link
                href={`${base}/starred`}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {messages.starred}
              </Link>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher locale={locale} />

          {user ? (
            <>
              <Link
                href={`${base}/prompts/new`}
                className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 hidden sm:inline-flex')}
              >
                <Plus className="h-3.5 w-3.5" /> {messages.newPrompt}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-2 ring-transparent hover:ring-primary transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium truncate">@{profile?.username}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href={`${base}/profile/${profile?.username}`} />}>
                    {messages.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`${base}/prompts/new`} className="sm:hidden" />}>
                    {messages.newPrompt}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`${base}/starred`} />}>
                    {messages.starred}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`${base}/profile/settings`} />}>
                    {messages.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    {messages.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`${base}/auth/login`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                {messages.login}
              </Link>
              <Link href={`${base}/auth/register`} className={cn(buttonVariants({ size: 'sm' }))}>
                {messages.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
