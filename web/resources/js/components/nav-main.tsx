import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Conversation } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { MessagesSquare, PlusCircle } from 'lucide-react';

export function NavMain({ conversationItems = [] }: { conversationItems: Conversation[] }) {
    const page = usePage();
    // console.log('Conversations: ', page.props.conversations);

    return (
        <SidebarGroup className="px-2 py-0">
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
                    <SidebarMenuButton asChild isActive={'/chat/index' === page.url}>
                        <Link href={'/chat/index'} prefetch>
                            <MessagesSquare />
                            <span className="text-xs font-semibold uppercase">All Chats</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroupLabel className="mt-2">Conversations</SidebarGroupLabel>
            <SidebarMenu>
                {conversationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={`/chat/${item.id}` === page.url}>
                            <Link href={`/chat/${item.id}`} prefetch>
                                <span className="text-xs font-semibold">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
