import { useEffect } from "react";
import { useDashboardStore } from "./store.js";

export function App() {
  const { sessions, loading, error, fetchSessions } = useDashboardStore();

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">useai</h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          <div className="text-zinc-400 text-sm">
            {sessions.length} sessions tracked
          </div>

          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-zinc-100">
                    {session.title || "Untitled session"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {session.client} &middot; {session.taskType} &middot;{" "}
                    {Math.round(session.durationMs / 60000)}min
                  </p>
                </div>
                {session.score && (
                  <span className="text-sm font-mono text-zinc-400">
                    {Math.round(session.score.overall * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
