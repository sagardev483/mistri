"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("Checking backend...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ping/")
      .then((res) => res.json())
      .then((data) => setStatus(`Backend says: ${data.message} (${data.status})`))
      .catch((err) => setStatus(`Error reaching backend: ${err.message}`));
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Mistri Walking Skeleton
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{status}</p>
    </div>
  );
}