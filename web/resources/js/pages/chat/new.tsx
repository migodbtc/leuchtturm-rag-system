import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BrainCircuit, Loader2, Send } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Chat',
        href: '/new',
    },
];

export default function NewChat() {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
        }
    };

    const handleSubmit = async () => {
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ??
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ??
                '';

            const res = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Inertia': 'true',
                    'X-Inertia-Version': document.querySelector('meta[name="inertia-version"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ message: text.trim() }),
            });

            // Laravel redirects to /chat/{id} — follow it via a full page visit
            // so Inertia picks up the flashed pendingMessageId prop correctly.
            if (res.redirected || res.ok) {
                window.location.href = res.url || '/chat';
                return;
            }

            const data = await res.json().catch(() => ({}));
            setError(data?.message ?? 'Something went wrong. Please try again.');
        } catch {
            setError('Could not reach the server. Check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Chat" />
            <div className="flex h-full flex-1 flex-col items-center justify-center px-4 py-8">
                {/* Greeting */}
                <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center">
                    <BrainCircuit size={36} className="text-orange-400" />
                    <h1 className="text-foreground text-2xl font-light">What's on your mind today?</h1>
                    <p className="w-lg font-light text-gray-500 italic">Ask me anything. I'll do my best to answer based on the context I have.</p>
                </div>

                {/* Composer */}
                <div className="w-full max-w-2xl space-y-2">
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div
                        className={[
                            'border-input bg-background flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all duration-200',
                            submitting ? 'opacity-90 ring-1 ring-orange-400/30' : 'focus-within:ring-1 focus-within:ring-orange-400/40',
                        ].join(' ')}
                    >
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={text}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyDown}
                            placeholder={submitting ? 'Starting conversation…' : 'Ask anything  (Enter to send, Shift+Enter for newline)'}
                            disabled={submitting}
                            autoFocus
                            className="text-foreground placeholder:text-muted-foreground flex max-h-40 flex-1 resize-none items-start overflow-y-auto bg-transparent py-0.5 text-sm outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !text.trim()}
                            aria-label="Send message"
                            className={[
                                'mb-0.5 flex-shrink-0 rounded-lg p-1.5 transition-all duration-150',
                                submitting || !text.trim()
                                    ? 'text-muted-foreground cursor-not-allowed opacity-40'
                                    : 'cursor-pointer text-orange-400 hover:bg-orange-400/10 hover:text-orange-300',
                            ].join(' ')}
                        >
                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-600">A new conversation will be created from your first message.</p>
                </div>
            </div>
        </AppLayout>
    );
}
