import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account settings',
        href: '/settings/account',
    },
];

export default function Account() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Danger Zone */}
                    <div className="space-y-4">
                        <HeadingSmall title="Danger Zone" description="Irreversible account actions" />
                        <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-medium text-slate-100">Delete All Conversations</p>
                                        <p className="text-sm text-slate-400">
                                            This action cannot be undone. All chat history will be permanently deleted.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="rounded-sm bg-red-900 text-sm font-semibold text-red-100 transition-all hover:bg-red-800"
                                >
                                    <Trash2 size={15} />
                                    Delete All
                                </Button>
                            </div>
                        </div>

                        {showDeleteModal && (
                            <div className="bg-opacity-50 rounded-lg border border-red-700 bg-red-950 p-4">
                                <p className="mb-4 text-sm font-medium text-red-100">
                                    Are you sure? This will delete all your conversations permanently.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="rounded-sm bg-slate-700 text-sm font-semibold text-slate-100 transition-all hover:bg-slate-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="rounded-sm bg-red-700 text-sm font-semibold text-red-50 transition-all hover:bg-red-600">
                                        <Trash2 size={15} />
                                        Delete Permanently
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
