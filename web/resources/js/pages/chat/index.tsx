import AppLayout from '@/layouts/app-layout';
import { Conversation, type BreadcrumbItem } from '@/types';
import { Button, Input } from '@headlessui/react';
import { Head, Link, router } from '@inertiajs/react';
import { Loader2, MessageSquare, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chat', href: '/chat' }];

type ChatIndexProps = {
    conversations: Conversation[];
    filters: { search: string };
};

export default function ChatIndex({ conversations, filters }: ChatIndexProps) {
    const [query, setQuery] = useState<string>(filters.search ?? '');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [localItems, setLocalItems] = useState<Conversation[]>(conversations);

    // Sync local list with fresh Inertia props when not mid-deletion
    const propIds = conversations.map((c) => c.id).join(',');
    const localIds = localItems.map((c) => c.id).join(',');
    if (propIds !== localIds && deletingId === null) {
        setLocalItems(conversations);
    }

    const onSearch = () => {
        router.get('/chat/all', { search: query }, { preserveState: true, replace: true });
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch();
    };

    const handleDelete = (e: React.MouseEvent, conversation: Conversation) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return;

        setDeletingId(conversation.id);

        // Optimistically remove item from list immediately
        setLocalItems((prev) => prev.filter((c) => c.id !== conversation.id));

        router.delete(`/chat/${conversation.id}`, {
            preserveScroll: true,
            onError: () => {
                // Restore on failure
                setLocalItems(conversations);
                setDeletingId(null);
            },
            onFinish: () => {
                setDeletingId(null);
            },
        });
    };

    const displayItems = deletingId !== null ? localItems : conversations;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversation Index" />
            <div className="flex h-full flex-1 flex-col items-center px-4 py-8">
                <div className="mb-4 flex w-4xl items-center justify-center align-middle">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={'Search your conversation title here...'}
                        className="flex-1 px-2"
                    />
                    <Button onClick={onSearch} className="h-10 cursor-pointer px-3">
                        <Search />
                    </Button>
                </div>
                <div className="w-4xl space-y-4 text-gray-500">
                    {displayItems.map((conversation) => {
                        const isDeleting = deletingId === conversation.id;
                        return (
                            <div
                                key={conversation.id}
                                className="group flex w-full items-center justify-between border-b border-b-gray-800 pb-2 select-none"
                            >
                                <Link
                                    className="flex flex-row gap-2 cursor-pointer"
                                    href={`/chat/${conversation.id}`}
                                >
                                    <MessageSquare />
                                    {conversation.title}
                                </Link>
                                <button
                                    onClick={(e) => handleDelete(e, conversation)}
                                    disabled={isDeleting}
                                    aria-label={`Delete conversation: ${conversation.title}`}
                                    title="Delete chat"
                                    className="ml-3 cursor-pointer rounded p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
