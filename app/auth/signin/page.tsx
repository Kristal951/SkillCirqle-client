"use client";
import LoginWithGoogleButton from "@/components/auth/LoginWithGoogleButton";
import Spinner from "@/components/ui/Spinner";
import { loginWithEmail } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
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
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition">
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

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const res = await loginWithEmail(email, password);
      const firstName = res?.user_metadata?.username?.split(" ")[0] || "User";

      toast.success(`Welcome back, ${firstName}!`, "Continue Cirqling");

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        toast.error("User not found", "Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        toast.error(
          "Incorrect password",
          "Please try again with correct password.",
        );
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format");
      } else if (error.code === "auth/invalid-credential") {
        toast.error(
          "Invalid credentials",
          "Please check your email and password.",
        );
      } else if (error.code === "auth/network-request-failed") {
        toast.error(
          "Login failed",
          "Please check your internet connection and try again.",
        );
      } else {
        toast.error("Login failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google signin clicked");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-6xl grid md:bg-surface rounded-xl md:shadow-lg grid-cols-1 md:grid-cols-2 overflow-hidden">
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
              <p className="text-sm sm:text-base text-text-secondary">
                Sign in to your account.
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <InputField
                id="email"
                icon={Mail}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />

              <InputField
                id="password"
                icon={Lock}
                type="password"
                placeholder="Password"
                isPassword
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />

              <div className="flex justify-end">
                <span className="text-xs sm:text-sm text-text-secondary hover:text-white cursor-pointer transition">
                  Forgot password?
                </span>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full disabled:bg-primary/50 bg-primary disabled:cursor-not-allowed text-white p-3 rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition text-sm sm:text-base"
              >
                {loading ? <Spinner /> : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-text-secondary" />
              <span className="text-xs sm:text-sm text-text-secondary">
                or continue with
              </span>
              <div className="flex-1 h-px bg-text-secondary" />
            </div>

            <LoginWithGoogleButton loading={loading} setLoading={setLoading} />

            <p className="text-xs sm:text-sm text-text-surface text-center">
              Don’t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-medium cursor-pointer hover:underline"
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
