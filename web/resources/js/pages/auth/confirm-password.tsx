// Components
import { Head, useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="flex items-center gap-1.5 text-slate-200">
                            <Lock size={15} />
                            Password
                        </Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Enter your current password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            className="border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-amber-500"
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button
                            className="w-full cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                            style={{
                                background: 'linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71))',
                            }}
                            disabled={processing}
                        >
                            <ShieldCheck size={15} />
                            {processing ? 'Confirming…' : 'Confirm password'}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
