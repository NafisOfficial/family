"use client";

import { useSweetAlert } from "@/hooks/useSweetAlert";
import { RelationshipType } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";

interface ConnectionRequestCard {
  _id: string;
  senderUsername: string;
  receiverUsername: string;
  relationshipType: RelationshipType;
  status: "pending" | "accepted" | "rejected";
}

interface SearchResultUser {
  _id: string;
  name: string;
  username: string;
}

interface ConnectionsManagerProps {
  pending: ConnectionRequestCard[];
  accepted: ConnectionRequestCard[];
}

type Tab = "suggestions" | "pending" | "accepted";

const SUGGESTED_CONNECTIONS: Array<{ _id: string; name: string; username: string }> = [
  { _id: "s1", name: "Anjali Sharma", username: "anjali.s" },
  { _id: "s2", name: "Rahul Mehta", username: "rahul.m" },
  { _id: "s3", name: "Priya Joshi", username: "priya.j" },
  { _id: "s4", name: "Sohail Khan", username: "sohail.k" },
];

export function ConnectionsManager({
  pending: initialPending,
  accepted: initialAccepted,
}: ConnectionsManagerProps) {
  const [pending, setPending] = useState<ConnectionRequestCard[]>(initialPending);
  const [accepted, setAccepted] = useState<ConnectionRequestCard[]>(initialAccepted);
  const [activeTab, setActiveTab] = useState<Tab>("suggestions");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { showSuccess, showError } = useSweetAlert();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query.trim())}`,
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Search failed");
        setResults(result.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const sendRequest = async (receiverUsername: string, id: string) => {
    setSendingId(id);
    try {
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverUsername, relationshipType: "cousin" }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send request");

      setPending((current) => [...current, result.data]);
      await showSuccess("Request sent", "Your connection request has been created.");
    } catch (error) {
      await showError(
        "Unable to send request",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSendingId(null);
    }
  };

  const updateRequestStatus = async (requestId: string, action: "accept" | "reject") => {
    try {
      const response = await fetch(`/api/connections/${requestId}/${action}`, {
        method: "POST",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Unable to ${action} request`);

      const acceptedRequest = pending.find((request) => request._id === requestId);

      setPending((current) => current.filter((request) => request._id !== requestId));

      if (action === "accept" && acceptedRequest) {
        setAccepted((current) => [...current, { ...acceptedRequest, status: "accepted" }]);
      }

      await showSuccess("Request updated", `Request ${action}ed successfully.`);
    } catch (error) {
      await showError(
        "Unable to update request",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };

  const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

  const avatarColors = ["#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#6366f1"];
  const colorFor = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const tabs = useMemo(
    () => [
      { key: "suggestions" as Tab, label: "Suggestions", count: SUGGESTED_CONNECTIONS.length },
      { key: "pending" as Tab, label: "Pending", count: pending.length },
      { key: "accepted" as Tab, label: "Connected", count: accepted.length },
    ],
    [pending.length, accepted.length],
  );

  const isSearchMode = query.trim().length > 0;

  const Row = ({
    id,
    name,
    subtitle,
    action,
  }: {
    id: string;
    name: string;
    subtitle: string;
    action: React.ReactNode;
  }) => (
    <div
      key={id}
      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: colorFor(id) }}
        >
          {initial(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{name}</p>
          <p className="truncate text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Connection requests
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Memory network</h1>
        <p className="mt-2 text-slate-600">
          Find relatives, manage requests, and see who you're connected with.
        </p>

        <div className="relative mt-6">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or username"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        {isSearchMode ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Search results
            </h2>
            {searching ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                Searching...
              </p>
            ) : results.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                No one found for "{query}".
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((user) => (
                  <Row
                    key={user._id}
                    id={user._id}
                    name={user.name}
                    subtitle={`@${user.username}`}
                    action={
                      <button
                        type="button"
                        onClick={() => sendRequest(user.username, user._id)}
                        disabled={sendingId === user._id}
                        className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendingId === user._id ? "..." : "Connect"}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 rounded-full bg-slate-100 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab.key
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === "suggestions" &&
                (SUGGESTED_CONNECTIONS.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                    No suggestions right now.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SUGGESTED_CONNECTIONS.map((person) => (
                      <Row
                        key={person._id}
                        id={person._id}
                        name={person.name}
                        subtitle={`@${person.username}`}
                        action={
                          <button
                            type="button"
                            onClick={() => sendRequest(person.username, person._id)}
                            disabled={sendingId === person._id}
                            className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {sendingId === person._id ? "..." : "Connect"}
                          </button>
                        }
                      />
                    ))}
                  </div>
                ))}

              {activeTab === "pending" &&
                (pending.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                    No pending requests at the moment.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pending.map((request) => (
                      <Row
                        key={request._id}
                        id={request._id}
                        name={request.senderUsername}
                        subtitle={`Wants to connect as ${request.relationshipType}`}
                        action={
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request._id, "accept")}
                              className="rounded-full bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request._id, "reject")}
                              className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Reject
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ))}

              {activeTab === "accepted" &&
                (accepted.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                    Accepted connections will appear here.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {accepted.map((connection) => (
                      <Row
                        key={connection._id}
                        id={connection._id}
                        name={connection.senderUsername}
                        subtitle={connection.relationshipType}
                        action={
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            Connected
                          </span>
                        }
                      />
                    ))}
                  </div>
                ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}