import React from "react";

const CheckMail = ({
  email = "alex@rivera.design",
  // onResend,
  // onChangeEmail,
}) => {
  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center py-6 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 opacity-50 blur-[100px]"></div>
      </div>

      <div className="mb-8 relative inline-block">
        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
        <div className="relative bg-surface/30 backdrop-blur-md p-8 rounded-full border border-white/5">
          <div className="w-24 h-24 flex items-center justify-center bg-linear-to-br from-primary/70 to-primary rounded-3xl transform -rotate-12 shadow-2xl">
            <span
              className="material-symbols-outlined text-white text-5xl"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: "3rem" }}
            >
              mail
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Check your Email
        </h1>
        <p className="max-w-md mx-auto text-text-secondary text-lg leading-relaxed">
          We've sent a link to{" "}
          <span className="text-primary font-semibold">{email}</span>. Click it
          to verify your account and join the cirqle.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-xs">
        <button
          // onClick={onResend}
          className="group relative w-full py-4 bg-linear-to-br from-primary/80 to-primary rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(123,66,242,0.3)] hover:shadow-[0_15px_40px_rgba(123,66,242,0.4)]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Resend Email
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
        </button>

        <button
          // onClick={onChangeEmail}
          className="text-text-secondary hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
        >
          Change Email Address
        </button>

        <div className="mt-8 pt-8 border-t border-border/50 w-full flex flex-col items-center">
          <p className="text-text-secondary/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Quick Access
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              className="flex items-center gap-2 px-5 py-2 bg-surface/50 hover:bg-surface border border-border/40 transition-all rounded-full text-sm font-medium"
              href="https://mail.google.com"
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-lg">inbox</span>
              Inbox
            </a>
            <a
              className="flex items-center gap-2 px-5 py-2 bg-surface/50 hover:bg-surface border border-border/40 transition-all rounded-full text-sm font-medium"
              href="/support"
            >
              <span className="material-symbols-outlined text-lg">
                help_outline
              </span>
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckMail;
