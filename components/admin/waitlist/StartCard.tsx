export function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent?: 'positive' | 'negative';
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-surface/50 p-5">
            <p className="text-xs font-medium tracking-wide text-text-seondary">
                {label}
            </p>
            <p
                className={`mt-2 text-3xl font-bold ${accent === 'positive'
                        ? 'text-emerald-400'
                        : accent === 'negative'
                            ? 'text-red-400'
                            : 'text-white'
                    }`}
            >
                {value}
            </p>
        </div>
    );
}