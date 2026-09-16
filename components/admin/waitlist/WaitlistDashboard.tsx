'use client';

import WaitlistTable from '@/components/admin/waitlist/WaitlistTable';
import { useState, useCallback } from 'react';
import { StatCard } from './StartCard';

interface Signup {
    id: string;
    email: string;
    created_at: string;
}

interface StatsState {
    total: number;
    today: number;
    thisWeek: number;
    lastWeek: number;
}

function computeGrowth(thisWeek: number, lastWeek: number) {
    if (!lastWeek || lastWeek === 0) {
        return thisWeek > 0 ? 100 : 0;
    }
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export default function WaitlistDashboard({
    initialStats,
    initialRows,
    initialHasMore,
}: {
    initialStats: StatsState;
    initialRows: Signup[];
    initialHasMore: boolean;
}) {
    const [stats, setStats] = useState<StatsState>(initialStats);

    const handleSignupAdded = useCallback((signup: Signup) => {
        setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            today: prev.today + 1,
            thisWeek: prev.thisWeek + 1,
        }));
        void signup; 
    }, []);

    const handleSignupsRemoved = useCallback((removed: Signup[]) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

        let removedToday = 0;
        let removedThisWeek = 0;
        let removedLastWeek = 0;

        for (const signup of removed) {
            const createdAt = new Date(signup.created_at).getTime();

            if (createdAt >= oneDayAgo) {
                removedToday += 1;
            }
            if (createdAt >= oneWeekAgo) {
                removedThisWeek += 1;
            }
            if (createdAt >= twoWeeksAgo && createdAt < oneWeekAgo) {
                removedLastWeek += 1;
            }
        }

        setStats(prev => ({
            total: prev.total - removed.length,
            today: prev.today - removedToday,
            thisWeek: prev.thisWeek - removedThisWeek,
            lastWeek: prev.lastWeek - removedLastWeek,
        }));
    }, []);

    const growth = computeGrowth(stats.thisWeek, stats.lastWeek);

    return (
        <>
            <div className="mb-6 grid grid-cols-4 gap-4">
                <StatCard label="TOTAL" value={stats.total} />
                <StatCard label="TODAY" value={stats.today} />
                <StatCard label="THIS WEEK" value={stats.thisWeek} />
                <StatCard
                    label="GROWTH"
                    value={`${growth > 0 ? '+' : ''}${growth}%`}
                    accent={growth >= 0 ? 'positive' : 'negative'}
                />
            </div>

            <WaitlistTable
                initialRows={initialRows}
                initialHasMore={initialHasMore}
                onSignupAdded={handleSignupAdded}
                onSignupsRemoved={handleSignupsRemoved}
            />
        </>
    );
}

