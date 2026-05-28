export default function Heading({ title, description }: { title: string; description?: string }) {
    return (
        <>
            <div className="mb-8 space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-200">{title}</h2>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
        </>
    );
}
