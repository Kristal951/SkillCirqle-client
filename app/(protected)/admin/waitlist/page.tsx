import WaitlistDashboard from '@/components/admin/waitlist/WaitlistDashboard';
import { createSupabaseServer } from '@/lib/supabaseServer';

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

    return {
        total: total ?? 0,
        today: today ?? 0,
        thisWeek: thisWeek ?? 0,
        lastWeek: lastWeek ?? 0,
    };
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

            <WaitlistDashboard
                initialStats={stats}
                initialRows={firstPage.rows}
                initialHasMore={firstPage.hasMore}
            />
        </div>
    );
}