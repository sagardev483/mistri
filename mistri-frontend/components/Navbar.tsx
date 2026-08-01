"use client";

import Link from "next/link";
import { useAuth } from "@/context/useAuth";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-semibold">
        Mistri
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/services" className="hover:underline">
          Services
        </Link>

        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <button onClick={logout} className="rounded bg-zinc-800 px-3 py-1.5 text-white">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded bg-black px-3 py-1.5 text-white"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}