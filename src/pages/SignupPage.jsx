import AuthCard from "../components/AuthCard";

export default function SignupPage() {
  return (
    <AuthCard mode="signup" title="Register">
      <div className="space-y-6">
        <input
          type="text"
          placeholder="Username"
          className="w-full bg-transparent border-b border-white/30
            text-white py-2 outline-none
            focus:border-cyan-400 transition"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent border-b border-white/30
            text-white py-2 outline-none
            focus:border-cyan-400 transition"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-transparent border-b border-white/30
            text-white py-2 outline-none
            focus:border-cyan-400 transition"
        />

        <button
          className="mt-6 py-3 rounded-full
            bg-gradient-to-r from-cyan-400 to-blue-600
            text-black font-semibold
            hover:scale-105 transition-transform"
        >
          Sign Up
        </button>
      </div>
    </AuthCard>
  );
}