// Components
import { Head, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-500">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button
                    disabled={processing}
                    className="cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
                    style={{
                        background: 'linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71))',
                    }}
                >
                    <MailCheck size={15} />
                    {processing ? 'Sending…' : 'Resend verification email'}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm text-slate-500 hover:text-orange-400">
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
