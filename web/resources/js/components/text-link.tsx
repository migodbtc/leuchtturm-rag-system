import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({ className = '', children, ...props }: LinkProps) {
    return (
        <Link
            className={cn(
                'text-orange-400 underline decoration-orange-800 underline-offset-4 transition-colors duration-300 ease-out hover:text-yellow-400 hover:decoration-yellow-600',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
