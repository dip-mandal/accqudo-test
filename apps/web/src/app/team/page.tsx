'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  ArrowRight,
  LogOut,
  Lock,
  BarChart3,
  ShoppingBag,
} from 'lucide-react';

interface StaffUser {
  id: number;
  email: string;
  role: string;
}

export default function TeamPortalLandingPage() {
  const router = useRouter();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8001/api/v1'
  ).replace(/\/$/, '');

  useEffect(() => {
    let isMounted = true;

    const verifyStaffAccess = async () => {
      try {
        // --------------------------------------------------
        // Get JWT token
        // --------------------------------------------------
        const token =
          localStorage.getItem('accqudo_token') ||
          localStorage.getItem('token');

        if (!token) {
          router.replace('/login');
          return;
        }

        // --------------------------------------------------
        // Verify TEAM / ADMIN / SUPER_ADMIN access.
        //
        // /team/hierarchy is protected by the backend's
        // staff-role dependency and therefore acts as the
        // canonical Team Portal access check.
        // --------------------------------------------------
        const response = await fetch(`${apiBase}/team/hierarchy`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        });

        // --------------------------------------------------
        // Authentication failed
        // --------------------------------------------------
        if (response.status === 401) {
          console.error(
            'Staff authentication failed: JWT was rejected by the API.'
          );

          localStorage.removeItem('accqudo_token');
          localStorage.removeItem('token');
          localStorage.removeItem('accqudo_user');

          if (isMounted) {
            setLoading(false);
          }

          router.replace('/login');
          return;
        }

        // --------------------------------------------------
        // Authenticated but not authorized
        // --------------------------------------------------
        if (response.status === 403) {
          console.error(
            'Staff authorization failed: user does not have TEAM/ADMIN/SUPER_ADMIN role.'
          );

          if (isMounted) {
            setLoading(false);
          }

          router.replace('/dashboard');
          return;
        }

        // --------------------------------------------------
        // Other API errors
        // --------------------------------------------------
        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            'Team access check failed:',
            response.status,
            errorText
          );

          throw new Error(
            `Unable to verify staff access (${response.status}).`
          );
        }

        // --------------------------------------------------
        // The hierarchy endpoint returns hierarchy data,
        // not the current user.
        //
        // Recover display information from the cached user
        // and fall back to the role stored inside the JWT.
        // --------------------------------------------------
        await response.json();

        let cachedUser: Partial<StaffUser> = {};

        try {
          const rawUser = localStorage.getItem('accqudo_user');

          if (rawUser) {
            const parsed = JSON.parse(rawUser);

            if (
              parsed &&
              typeof parsed === 'object'
            ) {
              cachedUser = parsed as Partial<StaffUser>;
            }
          }
        } catch {
          // Ignore malformed cached user data.
        }

        // --------------------------------------------------
        // Decode JWT payload only for display information.
        //
        // The backend has already authenticated the token,
        // so this decode is NOT used as an authorization
        // mechanism.
        // --------------------------------------------------
        let tokenRole = '';

        try {
          const payload = token.split('.')[1];

          if (payload) {
            const normalized = payload
              .replace(/-/g, '+')
              .replace(/_/g, '/');

            const padded = normalized.padEnd(
              normalized.length +
                ((4 - (normalized.length % 4)) % 4),
              '='
            );

            const decoded = JSON.parse(atob(padded));

            tokenRole = String(
              decoded?.role || ''
            ).trim();
          }
        } catch {
          // Ignore client-side JWT decoding errors.
          // Backend authorization has already succeeded.
        }

        const authenticatedUser: StaffUser = {
          id: Number(cachedUser.id || 0),
          email: String(
            cachedUser.email || 'Staff User'
          ),
          role: String(
            cachedUser.role ||
              tokenRole ||
              'TEAM'
          ),
        };

        // --------------------------------------------------
        // Success
        // --------------------------------------------------
        if (isMounted) {
          setUser(authenticatedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          'Team portal authentication error:',
          error
        );

        if (isMounted) {
          setLoading(false);
        }

        router.replace('/dashboard');
      }
    };

    verifyStaffAccess();

    return () => {
      isMounted = false;
    };
  }, [apiBase, router]);

  // --------------------------------------------------------
  // Sign out
  // --------------------------------------------------------

  const handleSignOut = () => {
    localStorage.removeItem('accqudo_token');
    localStorage.removeItem('token');
    localStorage.removeItem('accqudo_user');

    router.replace('/login');
  };

  // --------------------------------------------------------
  // Loading state
  // --------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1F3A5C]/20 border-t-[#1F3A5C]" />

          <p className="font-mono text-xs font-semibold text-stone-500">
            Verifying Staff Credentials &amp; Permissions...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // Role handling
  // --------------------------------------------------------

  const roleUpper = String(user?.role || '')
    .toUpperCase()
    .trim();

  const isAdminOrSuper =
    roleUpper === 'ADMIN' ||
    roleUpper === 'SUPER_ADMIN';

  const isSuper =
    roleUpper === 'SUPER_ADMIN';

  // --------------------------------------------------------
  // Main UI
  // --------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FAF8F3] px-4 py-10 font-sans text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-stone-200 border-t-4 border-t-[#1F3A5C] bg-white p-6 shadow-sm sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2">

              <span className="flex items-center gap-1 rounded-full bg-[#1F3A5C] px-3 py-0.5 text-xs font-bold text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff Terminal
              </span>

              <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs font-bold text-stone-600">
                ROLE: {user?.role}
              </span>

            </div>

            <h1 className="mt-2 font-serif text-2xl font-bold text-[#16293F]">
              Accqudo Team Authoring Console
            </h1>

            <p className="mt-0.5 text-xs text-stone-500">
              Logged in as {user?.email}. Authorized to author
              questions, assemble papers, and manage the
              academic hierarchy.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-50"
            >
              Candidate Portal
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>

          </div>
        </header>

        {/* Modules */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Question Studio */}
          <div
            onClick={() => router.push('/team/questions')}
            className="group cursor-pointer space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-[#1F3A5C]"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F3A5C]/10 text-[#1F3A5C]">
                <BookOpen className="h-6 w-6" />
              </div>

              <span className="flex items-center gap-1 text-xs font-bold text-[#1F3A5C] transition group-hover:translate-x-1">
                Open Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </span>

            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#16293F]">
                Question Authoring &amp; Paper Studio
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                Author MCQ, MSQ, and NAT questions with full
                KaTeX mathematical notation, attach diagram
                assets, build full tests, or manage academic
                taxonomy.
              </p>
            </div>
          </div>

          {/* Your Contribution */}
          <div
            onClick={() => router.push('/team/contribution')}
            className="group cursor-pointer space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-[#1F3A5C]"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F3A5C]/10 text-[#1F3A5C]">
                <BarChart3 className="h-6 w-6" />
              </div>

              <span className="flex items-center gap-1 text-xs font-bold text-[#1F3A5C] transition group-hover:translate-x-1">
                View Contribution
                <ArrowRight className="h-3.5 w-3.5" />
              </span>

            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#16293F]">
                Your Contribution
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                View your contribution, authored questions,
                papers, and other academic activities.
              </p>
            </div>
          </div>

          {/* Admin Panel */}
          {isAdminOrSuper ? (
            <div
              onClick={() => router.push('/ptz/admin')}
              className="group cursor-pointer space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-[#1F3A5C]"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-purple-700 transition group-hover:translate-x-1">
                  Access Admin
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>

              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#16293F]">
                  System Administration Panel
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Manage user accounts, assign team roles,
                  inspect global audit logs, and oversee
                  financial subscriptions.
                </p>
              </div>
            </div>
          ) : (
            <div className="cursor-not-allowed space-y-4 rounded-2xl border border-stone-200 bg-stone-100 p-6 opacity-75 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-200 text-stone-500">
                  <Lock className="h-6 w-6" />
                </div>

                <span className="rounded bg-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase text-stone-600">
                  Admin Only
                </span>

              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-stone-600">
                  System Administration Panel
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-400">
                  Restricted area. Team members do not have
                  privileges to visit the system administration
                  panel.
                </p>
              </div>

            </div>
          )}

          {/* Package Sells */}
          {isAdminOrSuper ? (
            <div
              onClick={() => router.push('/team/sells')}
              className="group cursor-pointer space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-[#1F3A5C]"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-purple-700 transition group-hover:translate-x-1">
                  View Package Sells
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>

              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#16293F]">
                  Packege Sells
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  View package sales, purchase activity,
                  and related subscription information.
                </p>
              </div>
            </div>
          ) : null}

          {/* Super Admin Panel */}
          {isSuper ? (
            <div
              onClick={() => router.push('/ptz/admin/studio')}
              className="group cursor-pointer space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-[#1F3A5C]"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-purple-700 transition group-hover:translate-x-1">
                  Access Super Admin
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>

              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#16293F]">
                  Top Level System Administration Panel
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Manage user accounts, assign team roles,
                  inspect global audit logs, and oversee
                  financial subscriptions.
                </p>
              </div>
            </div>
          ) : (
            <div className="cursor-not-allowed space-y-4 rounded-2xl border border-stone-200 bg-stone-100 p-6 opacity-75 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-200 text-stone-500">
                  <Lock className="h-6 w-6" />
                </div>

                <span className="rounded bg-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase text-stone-600">
                  Super Admin Only
                </span>

              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-stone-600">
                  Top Level System Administration Panel
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-stone-400">
                  Restricted area. Team members &amp; Admins do not have
                  privileges to visit the Top Level system administration
                  panel.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}