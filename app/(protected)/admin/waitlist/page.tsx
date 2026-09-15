import WaitlistTable from '@/components/admin/waitlist/WaitlistTable';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

const PAGE_SIZE = 20;

async function getStats() {
    const supabase = await createSupabaseServer();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: total }, { count: today }, { count: thisWeek }, { count: lastWeek }] =
        await Promise.all([
            supabase.from('waitlist_signups').select('*', { count: 'exact', head: true }),
            supabase.from('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
            supabase.from('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
            supabase.from('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo).lt('created_at', oneWeekAgo),
        ]);

    const growth =
        !lastWeek || lastWeek === 0
            ? (thisWeek ?? 0) > 0 ? 100 : 0
            : Math.round((((thisWeek ?? 0) - lastWeek) / lastWeek) * 100);

    return { total: total ?? 0, today: today ?? 0, thisWeek: thisWeek ?? 0, growth };
}

async function getFirstPage() {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
        .from('waitlist_signups')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE + 1);

    if (error) throw error;

    const hasMore = data.length > PAGE_SIZE;
    return { rows: hasMore ? data.slice(0, PAGE_SIZE) : data, hasMore };
}

export default async function WaitlistPage() {
    const [stats, firstPage] = await Promise.all([getStats(), getFirstPage()]);

    return (
        <div className="px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Waitlist</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Monitor and manage pre-launch waitlist signups.
                </p>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4">
                <StatCard label="TOTAL" value={stats.total} />
                <StatCard label="TODAY" value={stats.today} />
                <StatCard label="THIS WEEK" value={stats.thisWeek} />
                <StatCard
                    label="GROWTH"
                    value={`${stats.growth > 0 ? '+' : ''}${stats.growth}%`}
                    accent={stats.growth >= 0 ? 'positive' : 'negative'}
                />
            </div>

            <WaitlistTable initialRows={firstPage.rows} initialHasMore={firstPage.hasMore} />
        </div>
    );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: 'positive' | 'negative' }) {
    return (
        <div className="rounded-xl border border-border/50 bg-surface/50 p-5">
            <p className="text-xs font-medium tracking-wide text-text-seondary">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${accent === 'positive' ? 'text-emerald-400' : accent === 'negative' ? 'text-red-400' : 'text-white'}`}>
                {value}
            </p>
        </div>
    );
}