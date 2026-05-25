import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BrainCircuit } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-black text-[#EDEDEC] lg:justify-center">
                <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
                    <div className="absolute top-1/2 left-0 h-96 w-96 -translate-x-2/3 -translate-y-1/2 rounded-full bg-amber-400/20 blur-3xl" />
                    <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-2/3 -translate-y-1/2 rounded-full bg-amber-200/20 blur-3xl" />
                </div>
                <header className="relative z-10 my-6 w-full max-w-85 text-sm not-has-[nav]:hidden lg:max-w-5xl">
                    <nav className="flex items-center justify-between gap-4">
                        <div className="flex flex-row gap-2 bg-linear-to-r from-amber-700 via-orange-400 to-yellow-300 bg-clip-text text-xl font-bold text-transparent">
                            <div className="h-fill flex items-center align-middle text-3xl">
                                <BrainCircuit className="text-orange-400 uppercase" />
                            </div>
                            <div className="flex flex-col gap-0">
                                <h1>LEUCHTTURM</h1>
                                <span className="text-xs font-normal text-slate-200 italic">Web RAG Infrastructure for Yellowpad </span>
                            </div>
                        </div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                style={{
                                    background:
                                        'linear-gradient(#000, #000) padding-box, linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71)) border-box',
                                    border: '1px solid transparent',
                                }}
                                className="inline-block cursor-pointer rounded-sm px-5 py-1.5 text-sm leading-normal text-orange-400 transition-all duration-300 hover:scale-105 hover:text-yellow-400"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex flex-row gap-4">
                                <Link
                                    href={route('login')}
                                    style={{
                                        background:
                                            'linear-gradient(#000, #000) padding-box, linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71)) border-box',
                                        border: '1px solid transparent',
                                    }}
                                    className="inline-block cursor-pointer rounded-sm px-5 py-1.5 text-sm leading-normal text-orange-400 transition-all duration-300 hover:scale-105 hover:text-yellow-400"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    style={{
                                        background:
                                            'linear-gradient(#000, #000) padding-box, linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71)) border-box',
                                        border: '1px solid transparent',
                                    }}
                                    className="inline-block cursor-pointer rounded-sm px-5 py-1.5 text-sm leading-normal text-orange-400 transition-all duration-300 hover:scale-105 hover:text-yellow-400"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </header>
                <div className="relative z-10 flex w-5xl items-center gap-2 overflow-hidden lg:grow">
                    <div className="justify-left flex h-full w-1/2 flex-col items-start gap-2">
                        <BrainCircuit size={48} className="mb-2 text-orange-400" />
                        <h1 className="text-left text-3xl font-bold text-slate-200 uppercase">Welcome to Leuchtturm!</h1>
                        <p className="w-full max-w-lg text-justify text-sm text-slate-400 italic">
                            A Retrieval-Augmented Generation (RAG) system based on the code architecture and design of Yellowpad, using ChromaDB,
                            Ollama, Gemini, Nomic, and more.
                        </p>
                    </div>
                    <div className="flex h-full w-1/2 items-center justify-center">Hello!</div>
                </div>
            </div>
        </>
    );
}
