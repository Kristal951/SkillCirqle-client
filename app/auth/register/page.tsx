"use client";

import Spinner from "@/components/ui/Spinner";
import { signUpWithEmail } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";

// Typed Props for InputField
interface InputFieldProps {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  id: string;
  isPassword?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  id,
  isPassword,
  value,
  onChange,
}: InputFieldProps) => {
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
        required
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

  const { fetchUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Perform Signup
      await signUpWithEmail(name, email, password);

      // 2. Sync the global store immediately so the layout redirect logic works
      await fetchUser();

      toast.success(`Hi ${name}!`, "Welcome to the Cirqle.");

      // 3. Redirect
      router.replace("/onboarding");
    } catch (error: any) {
      console.error("Signup Error:", error);

      const errorMessages: Record<string, { title: string; desc: string }> = {
        "auth/email-already-in-use": {
          title: "Invalid Email",
          desc: "This email is already in use. Try logging in instead.",
        },
        user_already_exists: {
          title: "User Already Registered",
          desc: "Please register with a different email.",
        },
        "auth/weak-password": {
          title: "Weak Password",
          desc: "Password should be at least 6 characters.",
        },
      };

      const err = errorMessages[error.code] || {
        title: "Registration Failed",
        desc: "Something went wrong. Please try again later.",
      };

      toast.error(err.title, err.desc);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl grid md:bg-surface rounded-xl md:shadow-lg grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side: Illustration */}
        <div className="hidden md:block relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkfTLY2_FjNY9BbFBnjpF0yjMomBA3ldQ3rkP_KXVYCag1uuo0Sbb_74WyznSefv3iq_7nzM0WjkDX6NPdm4KLosF7xUSh2ovFDiU9evUs5lYr8xz5u6frKc5GaeTumpWlG9oAlZR9PhST-90SAWxTCc1rkrZVufZQS9L_1pCn_YHEQez183RweFVgdf0U-YTERCnRfMYOgQFh_miEqENcRZd-g8d8wEEEorHX8CofiiuWPJ4GTSgkz8fICJrL58hfqaAYDA-95V60"
            alt="Join SkillCirqle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Right Side: Form */}
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
                onChange={(e) => setName(e.target.value)}
              />

              <InputField
                id="email"
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                id="password"
                icon={Lock}
                type="password"
                placeholder="Password"
                isPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                disabled={loading}
                type="submit"
                className="w-full disabled:opacity-70 bg-primary text-white p-3 rounded-md font-medium hover:brightness-110 active:scale-[0.98] transition text-sm sm:text-base flex justify-center items-center"
              >
                {loading ? <Spinner size={20} /> : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs sm:text-sm text-gray-400">
                or sign up with
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => console.log("Google logic here")}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-md bg-surface border border-white/5 hover:bg-white/5 transition text-sm sm:text-base"
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
                className="text-primary font-medium hover:underline"
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
