import AppLayout from '@/layouts/app-layout';
import { Conversation, Message, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Clock, RefreshCw, Send, Sparkles } from 'lucide-react';

const scrollbarStyles = `
  .message-list::-webkit-scrollbar {
    width: 6px;
  }

  .message-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .message-list::-webkit-scrollbar-thumb {
    background: #f59e0b;
    border-radius: 3px;
  }

  .message-list::-webkit-scrollbar-thumb:hover {
    background: #d97706;
  }

  .message-list {
    scrollbar-color: #f59e0b transparent;
    scrollbar-width: thin;
  }
`;

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

// Dedicated type for single chat page using Message and Conversation
type SingleChatProps = {
    conversation: Conversation & { messages?: Message[] };
};

function MessageList({ messages }: { messages: Message[] }) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 text-center text-sm">
                    <Sparkles />
                    No messages yet.
                </div>
            </div>
        );
    }

    return (
        <div className="message-list flex max-h-[70vh] flex-1 flex-col-reverse gap-6 overflow-y-auto px-8">
            {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
            ))}
        </div>
    );
}

function MessageRow({ message }: { message: Message }) {
    const isUser = message.owner === 'user';
    const isUpdated = message.updated_at !== message.created_at;
    const timestamp = isUpdated ? message.updated_at : message.created_at;
    const timeLabel = isUpdated ? 'Updated' : 'Sent';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div
                className={[
                    'max-w-[75%] rounded-xl text-sm font-semibold',
                    isUser ? 'bg-linear-to-r from-orange-400 to-yellow-500 px-4 py-2 text-slate-900' : 'bg-transparent text-slate-200',
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

function MessageComposer() {
    return (
        <div className="border-input bg-background flex items-center gap-2 rounded-xl border px-4 py-3 shadow-md">
            <input
                type="text"
                placeholder="Ask anything"
                className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
            />
            <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                <Send className="size-5" />
            </button>
        </div>
    );
}

//
export default function SingleChat({ conversation }: SingleChatProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: conversation.title, href: `/chat/${conversation.id}` }];

    // console.log('Conversation data: ', conversation);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={conversation.title} />
            <style>{scrollbarStyles}</style>
            <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-end gap-6 px-4 py-6 sm:px-6 md:px-8">
                <MessageList messages={conversation.messages ?? []} />
                <MessageComposer />
            </div>
        </AppLayout>
    );
}
