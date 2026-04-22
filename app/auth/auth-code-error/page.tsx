import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We encountered a problem signing you in. This could be due to a database issue 
        or a canceled login attempt.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/auth/signin" 
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Try Again
        </Link>
        <Link 
          href="/support" 
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}