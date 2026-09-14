'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Spinner from '@/components/ui/Spinner';
import { toast } from "@/lib/toast";

async function submitWaitlist(email: string) {
    const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response from /api/waitlist:', res.status, text.slice(0, 200));
        throw new Error('Something went wrong. Please try again.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to join waitlist');
    return data;
}

export default function WaitlistForm() {
    const [email, setEmail] = useState('');

    const mutation = useMutation({
        mutationFn: submitWaitlist,
        onSuccess: () => {
            setEmail('');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        console.log(trimmedEmail)

        if (!trimmedEmail) return;

        mutation.mutate(trimmedEmail);
    };

    console.log(mutation)

    if (mutation.isSuccess) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-background text-text-primary">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-0 h-125 w-175 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(108,63,197,0.18) 0%, rgba(108,63,197,0) 70%)',
                    }}
                />

                <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
                    <header className="flex items-center justify-between py-7">
                        <a
                            href="/"
                            className="flex items-center gap-2.5"
                            aria-label="SkillCirqle home"
                        >
                            <div className="flex items-center gap-1 cursor-pointer">
                        <Image
                            src="/SkillCirqle.webp"
                            alt="SkillCirqle"
                            width={24}
                            height={27}
                            priority
                        />
                        <h1 className="text-xl text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text">
                            SkillCirqle
                        </h1>
                    </div>
                        </a>
                    </header>


                    <section className="flex flex-1 items-center justify-center py-16">
                        <div className="w-full max-w-xl text-center">
                            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_12px_35px_rgba(108,63,197,0.3)]">
                                    <svg
                                        width="27"
                                        height="27"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M5 12.5L9.5 17L19 7"
                                            stroke="white"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-text-primary">
                                You're in
                            </p>

                            <h1 className="text-4xl md:text-5xl text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text">
                                Welcome to the circle.
                            </h1>

                            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-text-secondary">
                                You're officially on the SkillCirqle waitlist.
                                We'll let you know when it's everything's up and running.
                            </p>

                            <a
                                href="/"
                                className="mt-14 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-text-primary shadow-[0_10px_30px_rgba(108,63,197,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5f35b4]"
                            >
                                Go Home

                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5 12h14M13 6l6 6-6 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>
                        </div>
                    </section>

                    <footer className="py-7 text-center text-xs text-black/35">
                        © {new Date().getFullYear()} SkillCirqle
                    </footer>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-text-primary">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-40 top-20 h-125 w-125 rounded-full bg-primary/10 blur-[110px]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 bottom-0 h-125 w-125 rounded-full bg-primary/10 blur-[110px]"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0,0,0,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.8) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col md:px-6 px-3 scrollbar-hide">
                <header className="flex items-center justify-between py-7">
                    <div className="flex items-center gap-1 cursor-pointer">
                        <Image
                            src="/SkillCirqle.webp"
                            alt="SkillCirqle"
                            width={24}
                            height={27}
                            priority
                        />
                        <h1 className="text-xl text-transparent font-bold tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text">
                            SkillCirqle
                        </h1>
                    </div>

                    <span className="rounded-3xl border border-border bg-primary/10 md:px-6 px-4 py-2 text-xs font-semibold text-text-primary">
                        Coming soon
                    </span>
                </header>

                <section className="flex flex-1 items-center justify-center py-16 sm:py-20">
                    <div className="w-full max-w-3xl text-center">
                        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                            Teach what you know.
                            <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Learn what you don't.</span>
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                            A collaborative learning platform where people use what they know to learn what they don't.
                        </p>

                        <div className="mx-auto mt-14 max-w-xl">
                            <div className="sm:p-2.5">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-2 sm:flex-row"
                                >
                                    <div className="relative flex-1">
                                        <svg
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-primary"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            />
                                            <path
                                                d="m5 6 7 6 7-6"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                            disabled={mutation.isPending}
                                            className="h-14 w-full rounded-xl border border-border bg-surface/50 pl-11 pr-4 text-sm outline-none transition placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className=" py-3 rounded-xl bg-primary md:px-7 text-sm font-semibold text-text-primary shadow-[0_8px_25px_rgba(108,63,197,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5f35b4] hover:shadow-[0_12px_30px_rgba(108,63,197,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                    >
                                        {mutation.isPending ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Spinner size={20} />
                                                Joining...
                                            </span>
                                        ) : (
                                            'Join the waitlist'
                                        )}
                                    </button>
                                </form>
                            </div>

                            <p className="mt-4 text-xs text-text-secondary">
                                We'll send you a launch notification when
                                SkillCirqle is ready.
                            </p>
                        </div>

                        <div className="mx-auto mt-24 grid md:max-w-lg w-full grid-cols-3 gap-2 md:gap-0 md:py-6">
                            <div className="px-3 flex flex-col items-center justify-center">
                                <p className="text-lg font-bold text-text-primary">
                                    Teach
                                </p>
                                <p className="mt-1 text-xs text-text-secondary">
                                    What you know
                                </p>
                            </div>

                            <div className="border-x border-border px-3 flex flex-col items-center justify-center">
                                <p className="text-lg font-bold text-primary">
                                    Learn
                                </p>
                                <p className="mt-1 text-xs text-text-secondary">
                                    What you don't
                                </p>
                            </div>

                            <div className="px-3 flex flex-col items-center justify-center">
                                <p className="text-lg font-bold text-text-primary">
                                    Grow
                                </p>
                                <p className="mt-1 text-xs text-text-secondary">
                                    in knowledge
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}