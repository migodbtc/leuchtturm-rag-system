import { Link } from '@inertiajs/react';
import { BrainCircuit } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-black p-6 lg:p-10">
            {/* Ambient glow blobs — mirrors welcome.tsx */}
            <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
                <div className="absolute top-1/2 left-0 h-96 w-96 -translate-x-2/3 -translate-y-1/2 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-2/3 -translate-y-1/2 rounded-full bg-amber-200/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full lg:max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex items-center justify-center">
                            <BrainCircuit className="text-orange-400" size={36} />
                        </Link>

                        {/* Title + description */}
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold text-slate-200">{title}</h1>
                            <p className="text-center text-sm text-slate-500">{description}</p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
