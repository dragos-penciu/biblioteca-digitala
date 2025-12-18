"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchBar({
  placeholder = "Search books or users…",
  minChars = 2,
  debounceMs = 600,
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const cache = useRef(new Map());
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    setError("");

    if (trimmed.length < minChars) {
      setBooks([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    const key = trimmed.toLowerCase();

    if (cache.current.has(key)) {
      const cached = cache.current.get(key);
      setBooks(cached.books);
      setUsers(cached.users);
      setOpen(true);
      setLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const [booksRes, usersRes] = await Promise.all([
          fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          }),
          fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          }),
        ]);

        if (!booksRes.ok) throw new Error("Books search failed");
        if (!usersRes.ok) throw new Error("Users search failed");

        const booksJson = await booksRes.json();
        const usersJson = await usersRes.json();

        const nextBooks = booksJson.items || [];
        const nextUsers = usersJson.users || [];

        cache.current.set(key, { books: nextBooks, users: nextUsers });

        setBooks(nextBooks);
        setUsers(nextUsers);
        setOpen(true);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError("Search failed. Try again.");
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(t);
  }, [trimmed, minChars, debounceMs]);

  function close() {
    setOpen(false);
  }

  function onFocus() {
    if (trimmed.length >= minChars) setOpen(true);
  }

  return (
    <div className="relative min-w-full md:px-32 md:mt-2">
      <div className="flex items-center gap-2 rounded-2xl bg-surface border border-border px-4 py-3 shadow-sm">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-primary placeholder:text-muted"
        />
        {loading ? (
          <span className="text-muted text-sm">…</span>
        ) : (
          q.length > 0 && (
            <button
              onClick={() => {
                setQ("");
                setBooks([]);
                setUsers([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="text-muted cursor-pointer hover:text-primary transition text-sm"
              aria-label="Clear search"
              type="button"
            >
              ✕
            </button>
          )
        )}
      </div>

      {open && (books.length > 0 || users.length > 0 || error) && (
        <div
          className="absolute z-50 mt-2 w-full md:pr-64 overflow-hidden"
          onMouseDown={(e) => e.preventDefault()} 
        >
          {error ? (
            <div className="p-4 text-sm text-muted rounded-2xl border border-border bg-surface shadow-lg">{error}</div>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-2xl border border-border bg-surface shadow-lg">
              <Section title="Books" hidden={books.length === 0}>
                {books.slice(0, 6).map((b) => (
                  <Link
                    key={b.googleBooksId}
                    href={`/books/${b.googleBooksId}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition"
                  >
                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-bg relative">
                      {b.coverImage ? (
                        <Image
                          src={b.coverImage}
                          alt={b.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-primary">
                        {b.title}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {(b.authors || []).join(", ")}
                      </div>
                    </div>
                  </Link>
                ))}
              </Section>

              <Section title="Users" hidden={users.length === 0}>
                {users.slice(0, 6).map((u) => (
                  <Link
                    key={u.username}
                    href={`/users/${u.username}`}
                    onClick={close}
                    className="px-4 py-3 block hover:bg-bg transition"
                  >
                    <div className="text-sm text-primary font-medium">
                      @{u.username}
                    </div>
                  </Link>
                ))}
              </Section>

              {(books.length === 0 && users.length === 0) && (
                <div className="p-4 text-sm text-muted">No results.</div>
              )}
            </div>
          )}
        </div>
      )}

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          onClick={close}
          aria-label="Close search results"
        />
      )}
    </div>
  );
}

function Section({ title, hidden, children }) {
  if (hidden) return null;
  return (
    <div className="py-2">
      <div className="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
