import { type User } from '@/types';
import { User as UserIcon } from 'lucide-react';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    return (
        <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400">
                <UserIcon size={20} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-slate-200">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-slate-500">{user.email}</span>}
            </div>
        </>
    );
}
