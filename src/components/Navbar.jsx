"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useAuth() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    setUsername(token ? (u || "me") : null);
  }, []);

  return { username, isLoggedIn: Boolean(username) };
}

export default function Navbar() {
  const router = useRouter();
  const { username, isLoggedIn } = useAuth();

  const [openSearch, setOpenSearch] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!openSearch) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenSearch(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  useEffect(() => {
    if (!openUserMenu) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenUserMenu(false);
    };

    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [openUserMenu]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setOpenUserMenu(false);

    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky select-none flex justify-between top-0 z-40 bg-muted backdrop-blur">
        <div className="mx-auto min-w-full md:px-12 max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl md:text-3xl font-serif font-semibold tracking-tight text-white select-none"
            aria-label="Booklog home"
          >
            b<span className="text-accent">.</span>
          </Link>

          <div className="flex select-none items-center gap-4">
            <button
              type="button"
              onClick={() => setOpenSearch(true)}
              className="text-white select-none hover:text-accent cursor-pointer transition p-2 -mr-1"
              aria-label="Open search"
            >
              <IconSearch className="h-5 w-5 md:h-7 md:w-7" />
            </button>

            {mounted ? (
              isLoggedIn ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenUserMenu((v) => !v)}
                    className="text-white cursor-pointer select-none hover:text-accent transition p-2"
                    aria-label="User menu"
                  >
                    <IconUser className="h-5 w-5 md:h-7 md:w-7" />
                  </button>

                  {openUserMenu && (
                    <div
                      className="
                        absolute right-0 mt-2 w-40
                        rounded-xl border border-border bg-surface
                        shadow-lg overflow-hidden
                      "
                    >
                      <Link
                        href={`/users/${username}`}
                        onClick={() => setOpenUserMenu(false)}
                        className="
                          block px-4 py-2 text-sm text-primary
                          hover:bg-bg transition
                        "
                      >
                        Profile
                      </Link>

                      <button
                        type="button"
                        onClick={logout}
                        className="
                          w-full text-left cursor-pointer px-4 py-2 text-sm text-red-400
                          hover:bg-bg transition
                        "
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-white select-none hover:text-accent transition text-sm md:text-lg font-medium"
                >
                  Log in
                </Link>
              )
            ) : (
              <div className="select-none w-10 h-10" aria-hidden="true" />
            )}
          </div>
        </div>
      </header>

      {openSearch && (
        <div className="fixed select-none inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 fade-in cursor-default"
            onClick={() => setOpenSearch(false)}
            aria-label="Close search"
            type="button"
          />

          <div className="relative slide-down">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mt-14 pt-3">
                <div className="rounded-2xl select-none border border-border bg-surface shadow-xl p-4">
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <div className="text-sm font-semibold select-none text-primary">
                      Search
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenSearch(false)}
                      className="text-muted select-none cursor-pointer hover:text-primary transition text-sm"
                    >
                      Close
                    </button>
                  </div>

                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
