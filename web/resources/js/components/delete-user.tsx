import { useForm } from '@inertiajs/react';
import { AlertTriangle, Lock, Trash2 } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

// Components...
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Delete account" description="Delete your account and all of its resources" />

            {/* Warning box — red but dark/on-brand */}
            <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-2 text-red-400">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                        <p className="font-medium">Warning</p>
                        <p className="text-sm text-red-400/80">Please proceed with caution, this cannot be undone.</p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(to right, rgb(153, 27, 27), rgb(220, 38, 38), rgb(239, 68, 68))' }}
                        >
                            <Trash2 size={15} />
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-800 bg-neutral-950 text-slate-200">
                        <DialogTitle className="text-slate-200">Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password
                            to confirm you would like to permanently delete your account.
                        </DialogDescription>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="flex items-center gap-1.5 text-slate-200">
                                    <Lock size={15} />
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Confirm your password"
                                    autoComplete="current-password"
                                    className="border-slate-700 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-red-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="ghost"
                                        onClick={closeModal}
                                        className="cursor-pointer rounded-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    disabled={processing}
                                    className="cursor-pointer rounded-sm text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02]"
                                    style={{ background: 'linear-gradient(to right, rgb(153, 27, 27), rgb(220, 38, 38), rgb(239, 68, 68))' }}
                                    asChild
                                >
                                    <button type="submit">
                                        <Trash2 size={15} />
                                        Delete account
                                    </button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
