"use client";

import { useAuth } from "@/context/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>You&apos;re not logged in. <a href="/login" className="underline">Log in</a></p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Welcome, {user.username}</h1>
      <p className="text-zinc-600">Account type: {user.user_type}</p>
      <button onClick={logout} className="rounded bg-zinc-800 px-4 py-2 text-white">
        Log out
      </button>
    </div>
  );
}