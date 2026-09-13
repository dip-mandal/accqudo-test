'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

interface TeamUser {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

interface AdminsTabProps {
  admins: AdminUser[];
  onRefresh: () => void;
}

export default function AdminsTab({
  admins,
  onRefresh,
}: AdminsTabProps) {
  const [emailInput, setEmailInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [teams, setTeams] = useState<TeamUser[]>([]);

  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  /**
   * Dynamic API Base resolver.
   *
   * Local:
   *   http://localhost:8001/api/v1
   *
   * Production:
   *   NEXT_PUBLIC_API_BASE_URL
   *   or https://api.accqudo.com/api/v1
   */
  const apiBase =
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
      ? 'http://localhost:8001/api/v1'
      : process.env.NEXT_PUBLIC_API_BASE_URL ||
        'https://api.accqudo.com/api/v1';

  /**
   * Get authentication token.
   */
  const getToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      localStorage.getItem('accqudo_token') ||
      localStorage.getItem('token')
    );
  };

  /**
   * Fetch all Team members.
   *
   * Backend:
   * GET /api/v1/super-admin/team
   */
  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeams(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please log in again.'
        );
      }

      const res = await fetch(
        `${apiBase}/super-admin/team`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            'Failed to load Team members.'
        );
      }

      /**
       * Expected backend response:
       *
       * [
       *   {
       *     id: 1,
       *     full_name: "...",
       *     email: "...",
       *     created_at: "..."
       *   }
       * ]
       */
      if (Array.isArray(data)) {
        setTeams(data);
      } else if (Array.isArray(data?.team_members)) {
        setTeams(data.team_members);
      } else if (Array.isArray(data?.teams)) {
        setTeams(data.teams);
      } else {
        setTeams([]);
      }
    } catch (err: any) {
      console.error(
        'Failed to fetch Team members:',
        err
      );

      setTeams([]);

      setMessage({
        text:
          err?.message ||
          'Failed to load Team members.',
        error: true,
      });
    } finally {
      setLoadingTeams(false);
    }
  }, [apiBase]);

  /**
   * Load Team members when this tab/component mounts.
   */
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  /**
   * Refresh both the parent Admin list and
   * the Team member list.
   */
  const refreshAll = async () => {
    onRefresh();
    await fetchTeamMembers();
  };

  /**
   * Grant / revoke ADMIN privilege.
   *
   * POST:
   * /api/v1/super-admin/admins/toggle
   */
  const handleToggleAdmin = async (
    email: string,
    makeAdmin: boolean
  ) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please log in again.'
        );
      }

      const res = await fetch(
        `${apiBase}/super-admin/admins/toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            make_admin: makeAdmin,
          }),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Failed to ${
              makeAdmin ? 'grant' : 'revoke'
            } Admin privilege.`
        );
      }

      setMessage({
        text: makeAdmin
          ? `Successfully granted Admin access to ${trimmedEmail}.`
          : `Successfully revoked Admin access from ${trimmedEmail}.`,
        error: false,
      });

      setEmailInput('');

      await refreshAll();
    } catch (err: any) {
      setMessage({
        text:
          err?.message ||
          'An unexpected error occurred while updating Admin privilege.',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Grant / revoke TEAM privilege.
   *
   * POST:
   * /api/v1/super-admin/team/toggle
   */
  const handleToggleTeam = async (
    email: string,
    makeTeam: boolean
  ) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Authentication token not found. Please log in again.'
        );
      }

      const res = await fetch(
        `${apiBase}/super-admin/team/toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            make_team: makeTeam,
          }),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Failed to ${
              makeTeam ? 'grant' : 'revoke'
            } Team privilege.`
        );
      }

      setMessage({
        text: makeTeam
          ? `Successfully granted Team access to ${trimmedEmail}.`
          : `Successfully revoked Team access from ${trimmedEmail}.`,
        error: false,
      });

      setEmailInput('');

      await refreshAll();
    } catch (err: any) {
      setMessage({
        text:
          err?.message ||
          'An unexpected error occurred while updating Team privilege.',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* =========================================================
          PRIVILEGE CONTROL
      ========================================================== */}

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">

        <div>
          <h2 className="text-base font-bold font-serif text-[#16293F]">
            Super Admin Privilege Control
          </h2>

          <p className="text-xs text-stone-500 mt-1">
            Promote or revoke Admin and Team access for any
            registered user using their account email address.
          </p>
        </div>

        {/* Status Message */}

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              message.error
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Email Input */}

        <div className="flex flex-col lg:flex-row gap-3">

          <input
            type="email"
            placeholder="Enter candidate email (e.g. user@example.com)"
            value={emailInput}
            onChange={(e) =>
              setEmailInput(e.target.value)
            }
            disabled={loading}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !loading &&
                emailInput.trim()
              ) {
                handleToggleTeam(
                  emailInput,
                  true
                );
              }
            }}
            className="flex-1 rounded-xl border border-stone-300 p-3 text-xs focus:outline-none focus:border-[#16293F] focus:ring-1 focus:ring-[#16293F] disabled:bg-stone-50"
          />

          <div className="flex flex-wrap gap-2">

            {/* Grant Admin */}

            <button
              onClick={() =>
                handleToggleAdmin(
                  emailInput,
                  true
                )
              }
              disabled={
                loading ||
                !emailInput.trim()
              }
              className="bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing...'
                : 'Grant Admin'}
            </button>

            {/* Revoke Admin */}

            <button
              onClick={() =>
                handleToggleAdmin(
                  emailInput,
                  false
                )
              }
              disabled={
                loading ||
                !emailInput.trim()
              }
              className="bg-rose-600 text-white font-bold px-5 py-3 rounded-xl text-xs hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revoke Admin
            </button>

            {/* Grant Team */}

            <button
              onClick={() =>
                handleToggleTeam(
                  emailInput,
                  true
                )
              }
              disabled={
                loading ||
                !emailInput.trim()
              }
              className="bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Grant Team
            </button>

            {/* Revoke Team */}

            <button
              onClick={() =>
                handleToggleTeam(
                  emailInput,
                  false
                )
              }
              disabled={
                loading ||
                !emailInput.trim()
              }
              className="bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revoke Team
            </button>

          </div>
        </div>
      </div>

      {/* =========================================================
          ADMINISTRATORS
      ========================================================== */}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        <div className="p-4 border-b border-stone-200 bg-stone-50">

          <div className="font-bold text-xs text-stone-700">
            Currently Authorized Administrators
          </div>

          <div className="text-[10px] text-stone-500 mt-1">
            Users with Admin-level access to the
            administrative console.
          </div>

        </div>

        {admins.length === 0 ? (

          <div className="p-8 text-center text-xs text-stone-500">
            No authorized administrators found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse text-xs">

              <thead>

                <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 font-mono">

                  <th className="p-3">
                    ID
                  </th>

                  <th className="p-3">
                    Name
                  </th>

                  <th className="p-3">
                    Email Address
                  </th>

                  <th className="p-3 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-stone-100">

                {admins.map((a) => (

                  <tr
                    key={a.id}
                    className="hover:bg-stone-50 transition"
                  >

                    <td className="p-3 font-mono">
                      #{a.id}
                    </td>

                    <td className="p-3 font-bold text-[#16293F]">
                      {a.full_name}
                    </td>

                    <td className="p-3 font-mono text-stone-600">
                      {a.email}
                    </td>

                    <td className="p-3 text-right">

                      <button
                        onClick={() =>
                          handleToggleAdmin(
                            a.email,
                            false
                          )
                        }
                        disabled={loading}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Demote Admin
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================================================
          TEAM MEMBERS
      ========================================================== */}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">

          <div>

            <div className="font-bold text-xs text-stone-700">
              Currently Authorized Team Members
            </div>

            <div className="text-[10px] text-stone-500 mt-1">
              Users with Team authoring and
              content-management access.
            </div>

          </div>

          {/* Manual refresh */}

          <button
            onClick={fetchTeamMembers}
            disabled={loadingTeams}
            className="text-[10px] font-bold text-[#16293F] bg-white border border-stone-300 px-3 py-2 rounded-lg hover:bg-stone-100 transition disabled:opacity-50"
          >
            {loadingTeams
              ? 'Loading...'
              : 'Refresh Team'}
          </button>

        </div>

        {/* Loading State */}

        {loadingTeams ? (

          <div className="p-10 text-center">

            <div className="text-xs font-semibold text-stone-500">
              Loading Team members...
            </div>

            <div className="text-[10px] text-stone-400 mt-1">
              Fetching authorized Team accounts from the
              server.
            </div>

          </div>

        ) : teams.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-xs font-semibold text-stone-500">
              No authorized Team members found.
            </div>

            <div className="text-[10px] text-stone-400 mt-1">
              Grant Team access using the email field above.
            </div>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse text-xs">

              <thead>

                <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 font-mono">

                  <th className="p-3">
                    ID
                  </th>

                  <th className="p-3">
                    Name
                  </th>

                  <th className="p-3">
                    Email Address
                  </th>

                  <th className="p-3">
                    Created At
                  </th>

                  <th className="p-3 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-stone-100">

                {teams.map((team) => (

                  <tr
                    key={team.id}
                    className="hover:bg-stone-50 transition"
                  >

                    <td className="p-3 font-mono">
                      #{team.id}
                    </td>

                    <td className="p-3 font-bold text-[#16293F]">
                      {team.full_name}
                    </td>

                    <td className="p-3 font-mono text-stone-600">
                      {team.email}
                    </td>

                    <td className="p-3 font-mono text-stone-500">
                      {team.created_at || '—'}
                    </td>

                    <td className="p-3 text-right">

                      <button
                        onClick={() =>
                          handleToggleTeam(
                            team.email,
                            false
                          )
                        }
                        disabled={loading}
                        className="text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove Team
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}