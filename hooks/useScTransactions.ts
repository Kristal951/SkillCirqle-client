import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UserTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  created_at: string;
}

export type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

const SORT_CONFIG: Record<
  SortOption,
  { column: "created_at" | "amount"; ascending: boolean }
> = {
  date_desc: { column: "created_at", ascending: false },
  date_asc: { column: "created_at", ascending: true },
  amount_desc: { column: "amount", ascending: false },
  amount_asc: { column: "amount", ascending: true },
};

const PAGE_SIZE = 15;

export function useScTransactions(userId: string, sortBy: SortOption) {
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const fetchPage = useCallback(
    async (pageOffset: number, replace: boolean) => {
      if (!userId) return;

      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const { column, ascending } = SORT_CONFIG[sortBy];

        const { data, error: transactionError } = await supabase
          .from("token_transactions")
          .select("id, type, amount, reason, created_at")
          .eq("user_id", userId)
          .order(column, { ascending })
          .range(pageOffset, pageOffset + PAGE_SIZE - 1);

        if (transactionError) {
          throw transactionError;
        }

        const page = data ?? [];
        setUserTransactions((prev) => (replace ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching user transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, sortBy],
  );

  useEffect(() => {
    offsetRef.current = 0;
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextOffset = offsetRef.current + PAGE_SIZE;
    offsetRef.current = nextOffset;
    fetchPage(nextOffset, false);
  }, [fetchPage, loadingMore, hasMore]);

  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`token-transactions-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (sortBy !== "date_desc") return;

          const transaction = payload.new as UserTransaction;
          setUserTransactions((prev) => {
            if (prev.some((t) => t.id === transaction.id)) return prev;
            return [transaction, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, sortBy]);

  return {
    userTransactions,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  };
}