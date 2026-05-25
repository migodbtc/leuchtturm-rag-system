import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="flex items-center gap-1.5 text-slate-200">
                            <Mail size={15} />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="flex items-center gap-1.5 text-slate-200">
                            <KeyRound size={15} />
                            New password
                        </Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
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
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Re-enter your new password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                        style={{
                            background: 'linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71))',
                        }}
                        disabled={processing}
                    >
                        <KeyRound size={15} />
                        {processing ? 'Resetting…' : 'Reset password'}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
