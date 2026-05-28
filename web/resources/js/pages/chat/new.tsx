import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BrainCircuit, Plus, Send } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Chat',
        href: '/chat/new',
    },
];

export default function NewChat() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Chat" />
            <div className="flex h-full flex-1 flex-col items-center justify-center px-4 py-8">
                {/* Greeting */}
                <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center">
                    <BrainCircuit size={36} className="text-orange-400" />
                    <h1 className="text-foreground text-2xl font-light">What's on your mind today?</h1>
                    <p className="w-lg font-light text-gray-500 italic">
                        Ask me anything related to Yellowpad. I'll try my best to give you an answer based on the context that I have.
                    </p>
                </div>

                {/* Message Input Area */}
                <div className="w-full max-w-2xl">
                    <div className="border-input bg-background flex items-center gap-2 rounded-xl border px-4 py-3 shadow-md">
                        {/* Add Button */}
                        <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                            <Plus className="size-5" />
                        </button>

                        {/* Input Field */}
                        <input
                            type="text"
                            placeholder="Ask anything"
                            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
                        />

                        {/* Send Button */}
                        <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                            <Send className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
