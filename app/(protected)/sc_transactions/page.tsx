"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Search,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useScTransactions, SortOption } from "@/hooks/useScTransactions";
import { useTokenStore } from "@/store/useTokenStore";
import { formatTransactionReason } from "@/utils/formatTransactionReason";

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: "Newest first",
  date_asc: "Oldest first",
  amount_desc: "Highest amount",
  amount_asc: "Lowest amount",
};

const Transactions = () => {
  const [filter, setFilter] = useState<"all" | "earned" | "spent">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  const { user } = useAuthStore();
  const { tokens, totalTokensEarned } = useTokenStore();
  const totalSpent = Math.max(0, totalTokensEarned - tokens);

  const {
    userTransactions,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  } = useScTransactions(user?.id || "", sortBy);

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((transaction) => {
      if (filter === "earned" && transaction.amount <= 0) {
        return false;
      }

      if (filter === "spent" && transaction.amount >= 0) {
        return false;
      }

      if (search.trim()) {
        const searchTerm = search.toLowerCase();
        const label = formatTransactionReason(transaction.reason).toLowerCase();

        return (
          transaction.reason.toLowerCase().includes(searchTerm) ||
          label.includes(searchTerm) ||
          transaction.type.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [userTransactions, filter, search]);

  const isDateSort = sortBy === "date_desc" || sortBy === "date_asc";

  const groupedTransactions = useMemo(() => {
    if (!isDateSort) return null;

    return filteredTransactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.created_at);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let label: string;

        if (date.toDateString() === today.toDateString()) {
          label = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          label = "Yesterday";
        } else {
          label = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }

        if (!groups[label]) {
          groups[label] = [];
        }

        groups[label].push(transaction);
        return groups;
      },
      {} as Record<string, typeof filteredTransactions>,
    );
  }, [filteredTransactions, isDateSort]);

  const renderTransactionRow = (
    transaction: (typeof filteredTransactions)[number],
  ) => {
    const isEarned = transaction.amount > 0;
    const transactionDate = new Date(transaction.created_at);
    const time = transactionDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <div
        key={transaction.id}
        className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface/50"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isEarned
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
              }`}
          >
            {isEarned ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {formatTransactionReason(transaction.reason)}
            </p>

            <p className="mt-1 truncate text-xs capitalize text-text-secondary">
              {transaction.type.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-semibold ${isEarned ? "text-emerald-500" : "text-red-500"
              }`}
          >
            {isEarned ? "+" : ""}
            {transaction.amount} SC
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            {!isDateSort
              ? transactionDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }) + ` · ${time}`
              : time}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background md:p-6 px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            SkillCredits Wallet
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage your SkillCredits and view your transaction history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface/50 p-5 transition hover:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-text-primary">
                Current Balance
              </span>

              <Coins size={20} className="text-accent" />
            </div>

            <p className="text-2xl font-semibold text-text-primary">
              {tokens} SC
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface/50 p-5 transition hover:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-text-primary">
                Total Earned
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <ArrowDownLeft size={17} />
              </div>
            </div>

            <p className="text-2xl font-semibold text-emerald-500">
              +{totalTokensEarned} SC
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface/50 p-5 transition hover:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-text-primary">
                Total Spent
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <ArrowUpRight size={17} />
              </div>
            </div>

            <p className="text-2xl font-semibold text-red-500">
              -{totalSpent} SC
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Transaction History
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Keep track of how your SkillCredits are earned and spent.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">

              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="h-11 w-full rounded-lg border border-border bg-surface/50 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex rounded-xl border border-border bg-background p-1 flex-wrap">
                {(["all", "earned", "spent"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-lg px-4 py-2 flex-1 text-sm capitalize transition ${filter === item
                        ? "bg-primary text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="relative">
                <ArrowUpDown
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-11 appearance-none rounded-lg border border-border bg-surface/50 pl-9 pr-8 text-sm text-text-primary outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && <TransactionsSkeleton />}

          {!loading && error && (
            <div className="p-12 text-center">
              <AlertTriangle
                size={32}
                className="mx-auto mb-3 text-red-500"
              />

              <p className="font-medium text-text-primary">
                Couldn't load transactions
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {error} Please try refreshing the page.
              </p>
            </div>
          )}

          {!loading && !error && filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <Coins
                size={32}
                className="mx-auto mb-3 text-text-secondary"
              />

              <p className="font-medium text-text-primary">
                No transactions found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Your SkillCredits transactions will appear here.
              </p>
            </div>
          )}

          {!loading && !error && filteredTransactions.length > 0 && (
            <>
              <div className="divide-y divide-border">
                {isDateSort && groupedTransactions
                  ? Object.entries(groupedTransactions).map(
                      ([date, dateTransactions]) => (
                        <div key={date}>
                          <div className="px-5 pb-2 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                              {date}
                            </p>
                          </div>

                          {dateTransactions.map(renderTransactionRow)}
                        </div>
                      ),
                    )
                  : filteredTransactions.map(renderTransactionRow)}
              </div>

              {hasMore && (
                <div className="p-5 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function TransactionsSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-text-primary/5" />

            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 rounded-full bg-text-primary/5" />
              <div className="h-2.5 w-20 rounded-full bg-text-primary/5" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="h-3 w-14 rounded-full bg-text-primary/5" />
            <div className="h-2.5 w-10 rounded-full bg-text-primary/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Transactions;