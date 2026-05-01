"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveUserRoute } from "@/lib/auth/resolver";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          const route = await resolveUserRoute();
          console.log("ROUTE:", route);
          router.replace(route);
          return;
        }
      } catch (err) {
        console.error(err);
      }

      setCheckingAuth(false);
    };

    run();

    const timeout = setTimeout(() => {
      setCheckingAuth(false);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [router]);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (!error) {
      router.push("/auth/callback");
    } else {
      alert(error.message);
    }
  };

  const signup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (!error) {
      router.push("/auth/callback");
    } else {
      alert(error.message);
    }
  };

  const googleLogin = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Initializing ERS...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900/70 backdrop-blur p-6 rounded-xl border border-white/10">
        
        <h1 className="text-2xl font-bold text-center mb-2">
          ERS
        </h1>

        <p className="text-center text-gray-400 mb-6 text-sm">
          Move faster in Lagos
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 bg-black border border-zinc-700 rounded"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-3 bg-black border border-zinc-700 rounded"
        />

        {/* LOGIN */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 py-3 rounded text-black font-bold mb-3"
        >
          {loading ? "Processing..." : "Login"}
        </button>

        {/* SIGNUP */}
        <button
          onClick={signup}
          disabled={loading}
          className="w-full border border-white/10 hover:bg-white/5 py-3 rounded mb-3"
        >
          Create Account
        </button>

        {/* FORGOT */}
        <p className="text-xs text-gray-500 text-center mb-4 cursor-pointer hover:text-white">
          Forgot Password?
        </p>

        <div className="text-center text-xs text-gray-500 mb-4">
          OR
        </div>

        {/* GOOGLE */}
        <button
          onClick={googleLogin}
          className="w-full bg-white text-black py-3 rounded font-semibold"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}