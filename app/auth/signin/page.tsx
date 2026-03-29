"use client";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const InputField = ({ icon: Icon, type, placeholder, id, isPassword }: any) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition">
        <Icon size={18} />
      </div>

      <input
        id={id}
        type={isPassword ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        className="w-full bg-background focus:border-primary focus:ring-2 focus:ring-primary/80 outline-none py-3 pl-10 pr-10 rounded-md transition text-sm sm:text-base"
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const SignIn = () => {
  const handleGoogleSignIn = () => {
    console.log("Google signin clicked");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl grid bg-surface-1 rounded-xl shadow-lg grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
            alt="signin visual"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="flex items-center justify-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Welcome Back 👋
              </h1>
              <p className="text-sm sm:text-base text-text-surface">
                Sign in to continue cirqling.
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5">
              <InputField
                id="email"
                icon={Mail}
                type="email"
                placeholder="Email address"
              />

              <InputField
                id="password"
                icon={Lock}
                type="password"
                placeholder="Password"
                isPassword
              />

              <div className="flex justify-end">
                <span className="text-xs sm:text-sm text-text-secondary hover:text-white cursor-pointer transition">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white p-3 rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition text-sm sm:text-base"
              >
                Sign In
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-text-secondary" />
              <span className="text-xs sm:text-sm text-gray-400">
                or continue with
              </span>
              <div className="flex-1 h-px bg-text-secondary" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-md bg-background cursor-pointer hover:bg-white/10 transition text-sm sm:text-base"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              <span className="font-medium">Continue with Google</span>
            </button>

            <p className="text-xs sm:text-sm text-text-surface text-center">
              Don’t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-white font-medium cursor-pointer hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
