export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header>
            <h3 className="mb-0.5 text-base font-medium text-slate-200">{title}</h3>
            {description && <p className="text-sm text-slate-500">{description}</p>}
        </header>
    );
}
