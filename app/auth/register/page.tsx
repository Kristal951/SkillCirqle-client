"use client";
import Spinner from "@/components/ui/Spinner";
import { signUpWithEmail } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  id,
  isPassword,
  value,
  onChange,
}: any) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
        <Icon size={18} />
      </div>

      <input
        id={id}
        type={isPassword ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-surface md:bg-background focus:border-primary focus:ring-2 focus:ring-primary/80 outline-none py-3 pl-10 pr-10 rounded-md transition text-sm sm:text-base"
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

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const res = await signUpWithEmail(name, email, password);
      toast.success(`Hi ${res.displayName}!`, "Welcome to the Cirqle.");

      router.replace("/onboarding");
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "Invalid Email",
          "This email is already in use. Try logging in instead.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google signup clicked");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl grid md:bg-surface rounded-xl md:shadow-lg grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="hidden md:block relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkfTLY2_FjNY9BbFBnjpF0yjMomBA3ldQ3rkP_KXVYCag1uuo0Sbb_74WyznSefv3iq_7nzM0WjkDX6NPdm4KLosF7xUSh2ovFDiU9evUs5lYr8xz5u6frKc5GaeTumpWlG9oAlZR9PhST-90SAWxTCc1rkrZVufZQS9L_1pCn_YHEQez183RweFVgdf0U-YTERCnRfMYOgQFh_miEqENcRZd-g8d8wEEEorHX8CofiiuWPJ4GTSgkz8fICJrL58hfqaAYDA-95V60"
            alt="signup visual"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="flex items-center justify-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Join the Cirqle
              </h1>
              <p className="text-sm sm:text-base text-text-surface">
                Start your journey to the SkillCirqle universe.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <InputField
                id="name"
                icon={User}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />

              <InputField
                id="email"
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />

              <InputField
                id="password"
                icon={Lock}
                type="password"
                placeholder="Password"
                isPassword
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />

              <button
                disabled={loading}
                type="submit"
                className="w-full disabled:opacity-50 bg-primary text-white p-3 rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition text-sm sm:text-base"
              >
                {loading ? <Spinner /> : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-text-secondary" />
              <span className="text-xs sm:text-sm text-gray-400">
                or sign in with
              </span>
              <div className="flex-1 h-px bg-text-secondary" />
            </div>

            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-md bg-surface md:bg-background cursor-pointer hover:bg-white/10 transition text-sm sm:text-base"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              <span className="font-medium">Continue with Google</span>
            </button>

            <p className="text-xs sm:text-sm text-text-surface text-center">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-white font-medium cursor-pointer hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
