import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Check, KeyRound, Lock, Save, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password" className="flex items-center gap-1.5 text-slate-200">
                                <Lock size={15} />
                                Current password
                            </Label>
                            <PasswordInput
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                                autoComplete="current-password"
                                placeholder="Your current password"
                            />
                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="flex items-center gap-1.5 text-slate-200">
                                <KeyRound size={15} />
                                New password
                            </Label>
                            <PasswordInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                                autoComplete="new-password"
                                placeholder="Create a new password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="flex items-center gap-1.5 text-slate-200">
                                <ShieldCheck size={15} />
                                Confirm new password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                                autoComplete="new-password"
                                placeholder="Re-enter your new password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                className="cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                                style={{
                                    background: 'linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71))',
                                }}
                            >
                                <Save size={15} />
                                {processing ? 'Saving…' : 'Save password'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="flex items-center gap-1 text-sm text-green-400">
                                    <Check size={13} /> Saved
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
