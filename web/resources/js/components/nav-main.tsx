import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Conversation } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2, MessagesSquare, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ conversationItems = [] }: { conversationItems: Conversation[] }) {
    const page = usePage();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [localItems, setLocalItems] = useState<Conversation[]>(conversationItems);

    // Keep localItems in sync when Inertia re-renders with fresh props
    // (after a full navigation). We compare by length/ids to avoid overwriting
    // an in-progress optimistic removal.
    const propIds = conversationItems.map((c) => c.id).join(',');
    const localIds = localItems.map((c) => c.id).join(',');
    if (propIds !== localIds && deletingId === null) {
        // Quiet sync — no setState during render, handled via ref pattern below.
    }

    const handleDelete = (e: React.MouseEvent, item: Conversation) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

        setDeletingId(item.id);

        // Optimistically remove from local list immediately
        setLocalItems((prev) => prev.filter((c) => c.id !== item.id));

        router.delete(`/chat/${item.id}`, {
            preserveScroll: true,
            onError: () => {
                // Restore item on failure
                setLocalItems(conversationItems);
                setDeletingId(null);
            },
            onFinish: () => {
                setDeletingId(null);
            },
        });
    };

    // Use prop list when no deletion is in flight (keeps fresh after navigations)
    const displayItems = deletingId !== null ? localItems : conversationItems;

    return (
        <SidebarGroup className="px-2 py-0">
            {/* Chat Ops Section */}
            <SidebarMenu>
                <SidebarMenuItem key={'new_conversation'}>
                    <SidebarMenuButton asChild isActive={['/chat/create', '/new'].includes(page.url)}>
                        <Link href={'/new'} prefetch>
                            <PlusCircle />
                            <span className="text-xs font-semibold uppercase">New Chat</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem key={'view_all_conversations'}>
                    <SidebarMenuButton asChild isActive={'/chat/all' === page.url}>
                        <Link href={'/chat/all'} prefetch>
                            <MessagesSquare />
                            <span className="text-xs font-semibold uppercase">All Chats</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>

            {/* Conversations Sidebar Index */}
            <SidebarGroupLabel className="mt-2">Conversations</SidebarGroupLabel>
            <SidebarMenu>
                {displayItems.map((item) => {
                    const isDeleting = deletingId === item.id;
                    return (
                        <SidebarMenuItem key={item.id} className="group/conv-item relative flex items-center">
                            <SidebarMenuButton
                                asChild
                                isActive={`/chat/${item.id}` === page.url}
                                className="flex-1 pr-7"
                            >
                                <Link href={`/chat/${item.id}`} prefetch>
                                    <span className="text-xs font-semibold">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                            <button
                                onClick={(e) => handleDelete(e, item)}
                                disabled={isDeleting}
                                aria-label={`Delete conversation: ${item.title}`}
                                title="Delete chat"
                                className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/conv-item:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="size-3.5" />
                                )}
                            </button>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
