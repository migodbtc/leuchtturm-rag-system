import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

// Shared Middleware Data
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    conversations?: Conversation[];
    [key: string]: unknown;
}

// PHP Models
export interface Message {
    id: number;
    conversation_id: number;
    owner: 'user' | 'bot';
    message: string;
    created_at: string;
    updated_at: string;
    conversation?: Conversation;
}

export interface Conversation {
    id: number;
    user_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    user?: User;
    messages?: Message[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    conversations?: Conversation[];
    remember_token?: string;
}
