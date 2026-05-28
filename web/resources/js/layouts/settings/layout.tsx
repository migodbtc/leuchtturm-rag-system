import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Bot, Database, KeyRound, UserRound } from 'lucide-react';

const sidebarNavItems: (NavItem & { icon: React.ElementType })[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: KeyRound,
    },
    {
        title: 'Conversations',
        url: '/settings/conversations',
        icon: Database,
    },
    {
        title: 'Model',
        url: '/settings/model',
        icon: Bot,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPath === item.url;
                            return (
                                <Button
                                    key={item.url}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start gap-2 text-slate-400 hover:bg-white/5 hover:text-slate-200',
                                        isActive && 'bg-white/10 text-slate-200',
                                    )}
                                >
                                    <Link href={item.url} prefetch>
                                        <Icon size={15} />
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 bg-slate-800 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
