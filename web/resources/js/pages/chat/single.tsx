import AppLayout from '@/layouts/app-layout';
import { Conversation, Message, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Clock, Loader2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

type SingleChatProps = {
    conversation: Conversation;
    messages: Message[];
    pendingMessageId?: number | null;
};

// ── Thinking bubble ────────────────────────────────────────────────────────────

function ThinkingBubble() {
    return (
        <div className="flex flex-col items-start">
            <div className="rounded-xl bg-transparent px-1 py-1">
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="size-2 rounded-full bg-slate-400"
                            style={{
                                animation: 'thinking-bounce 1.2s infinite',
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Message row ────────────────────────────────────────────────────────────────

function MessageRow({ message, animate }: { message: Message; animate?: boolean }) {
    const isUser = message.owner === 'user';
    const isUpdated = message.updated_at !== message.created_at;
    const timestamp = isUpdated ? message.updated_at : message.created_at;
    const timeLabel = isUpdated ? 'Updated' : 'Sent';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${animate ? 'msg-enter' : ''}`}>
            <div
                className={[
                    'max-w-[75%] rounded-xl text-sm font-semibold',
                    isUser ? 'bg-linear-to-r from-orange-400 to-yellow-500 px-4 py-2 text-slate-900' : 'bg-transparent px-1 text-slate-200',
                ].join(' ')}
            >
                {message.message}
            </div>
            <div className="mt-1 flex items-center gap-1 px-2 text-xs font-light text-slate-500">
                {isUpdated ? <RefreshCw className="size-3" /> : <Clock className="size-3" />}
                <span>
                    {timeLabel} {formatDate(timestamp)}
                </span>
            </div>
        </div>
    );
}

// ── Message list ───────────────────────────────────────────────────────────────

function MessageList({
    messages,
    thinking,
    newMessageIds,
    scrollRef,
}: {
    messages: Message[];
    thinking: boolean;
    newMessageIds: Set<number>;
    scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
    if (messages.length === 0 && !thinking) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 text-center text-sm">
                    <Sparkles />
                    No messages yet. Start the conversation!
                </div>
            </div>
        );
    }

    return (
        // overflow-y-auto + flex-col means we scroll from the top.
        // We use a sentinel div at the bottom and scroll it into view on new messages.
        <div ref={scrollRef} className="message-list flex flex-1 flex-col gap-4 overflow-y-auto px-2 pb-2">
            {messages.map((message) => (
                <MessageRow key={message.id} message={message} animate={newMessageIds.has(message.id)} />
            ))}
            {thinking && <ThinkingBubble />}
            {/* Sentinel — scrolled into view whenever messages change */}
            <div id="chat-bottom" />
        </div>
    );
}

// ── Composer ───────────────────────────────────────────────────────────────────

function MessageComposer({
    conversationId,
    onSent,
    onBotReply,
    onError,
}: {
    conversationId: number;
    onSent: (msg: Message) => void;
    onBotReply: (msg: Message) => void;
    onError: (msg: string) => void;
}) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Clear the poll interval when the component unmounts mid-poll
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // Auto-grow the textarea as the user types
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
        }
    };

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const pollStatus = (messageId: number) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/messages/${messageId}/status`, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    stopPolling();
                    setSending(false);
                    onError('Failed to retrieve the reply. Please refresh.');
                    return;
                }

                const data = await res.json();

                if (!data.pending) {
                    stopPolling();
                    setSending(false);
                    if (data.bot_reply) {
                        onBotReply(data.bot_reply);
                    }
                }
            } catch {
                stopPolling();
                setSending(false);
                onError('Lost connection while waiting for reply.');
            }
        }, 2000);
    };

    const handleSend = async () => {
        if (!text.trim() || sending) return;

        const body = text.trim();
        setText('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setSending(true);

        try {
            // Prefer the meta tag; fall back to the XSRF-TOKEN cookie Laravel sets
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ??
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ??
                '';

            const res = await fetch(`/chat/${conversationId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ message: body }),
            });

            if (!res.ok) {
                setSending(false);
                onError('Failed to send the message. Please try again.');
                return;
            }

            const userMessage: Message = await res.json();
            onSent(userMessage);
            pollStatus(userMessage.id);
        } catch {
            setSending(false);
            onError('Could not reach the server. Check your connection.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter sends; Shift+Enter inserts a newline
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            className={[
                'border-input bg-background flex items-start justify-center gap-3 rounded-2xl border px-4 py-3 align-middle shadow-lg transition-all duration-200',
                sending ? 'opacity-90 ring-1 ring-orange-400/30' : 'focus-within:ring-1 focus-within:ring-orange-400/40',
            ].join(' ')}
        >
            <textarea
                ref={textareaRef}
                rows={1}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={sending ? 'Waiting for reply…' : 'Ask anything  (Enter to send, Shift+Enter for newline)'}
                disabled={sending}
                className="text-foreground placeholder:text-muted-foreground max-h-40 flex-1 resize-none overflow-y-auto bg-transparent py-0.5 text-sm outline-none disabled:opacity-50"
            />
            <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                aria-label="Send message"
                className={[
                    'flex-shrink-0 rounded-lg p-1.5 transition-all duration-150',
                    sending || !text.trim()
                        ? 'text-muted-foreground cursor-not-allowed opacity-40'
                        : 'cursor-pointer text-orange-400 hover:bg-orange-400/10 hover:text-orange-300',
                ].join(' ')}
            >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
        </div>
    );
}

// ── Error toast ────────────────────────────────────────────────────────────────

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 5000);
        return () => clearTimeout(t);
    }, [message, onDismiss]);

    return (
        <div className="msg-enter flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            <AlertCircle className="size-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SingleChat({ conversation, messages: initialMessages, pendingMessageId }: SingleChatProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: conversation.title, href: `/chat/${conversation.id}` }];

    const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
    const [thinking, setThinking] = useState(!!pendingMessageId);
    const [error, setError] = useState<string | null>(null);
    const [newMessageIds, setNewMessageIds] = useState<Set<number>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Auto-poll on mount when arriving from new-chat redirect ──────────────
    useEffect(() => {
        if (!pendingMessageId) return;

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/messages/${pendingMessageId}/status`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    clearInterval(pollRef.current!);
                    setThinking(false);
                    return;
                }
                const data = await res.json();
                if (!data.pending) {
                    clearInterval(pollRef.current!);
                    setThinking(false);
                    if (data.bot_reply) {
                        addMessage(data.bot_reply, true);
                    }
                }
            } catch {
                clearInterval(pollRef.current!);
                setThinking(false);
            }
        }, 2000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to the bottom whenever messages or the thinking state change
    useEffect(() => {
        const sentinel = document.getElementById('chat-bottom');
        sentinel?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, thinking]);

    const addMessage = (msg: Message, isNew = false) => {
        setMessages((prev) => [...prev, msg]);
        if (isNew) {
            setNewMessageIds((prev) => new Set(prev).add(msg.id));
            // Remove the animation class after it plays so re-renders don't retrigger it
            setTimeout(() => {
                setNewMessageIds((prev) => {
                    const next = new Set(prev);
                    next.delete(msg.id);
                    return next;
                });
            }, 400);
        }
    };

    const handleSent = (msg: Message) => {
        addMessage(msg, true);
        setThinking(true);
        setError(null);
    };

    const handleBotReply = (msg: Message) => {
        setThinking(false);
        addMessage(msg, true);
    };

    const handleError = (msg: string) => {
        setThinking(false);
        setError(msg);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={conversation.title} />
            <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6 md:px-8">
                <MessageList messages={messages} thinking={thinking} newMessageIds={newMessageIds} scrollRef={scrollRef} />

                <div className="flex flex-col gap-2">
                    {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}
                    <MessageComposer conversationId={conversation.id} onSent={handleSent} onBotReply={handleBotReply} onError={handleError} />
                </div>
            </div>
        </AppLayout>
    );
}
