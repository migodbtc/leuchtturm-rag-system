import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative z-10 grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-100/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-100/10" />
                    </div>
                </div>
                <div className="relative z-10 min-h-[100vh] flex-1 rounded-xl border border-slate-800 md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-100/10" />
                </div>
            </div>
        </AppLayout>
    );
}
