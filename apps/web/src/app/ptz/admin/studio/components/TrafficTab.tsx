'use client';

import React, { useMemo, useState } from 'react';

interface TrafficLog {
  id: number;
  path: string;
  method: string;
  status_code: number;
  ip_address: string;
  user_agent: string;
  response_time_ms: number;
  timestamp: string;
}

interface TrafficStatusCount {
  status_code: number;
  count: number;
}

interface TrafficData {
  total_requests: number;
  unique_visitors: number;
  logs: TrafficLog[];
  status_summary?: TrafficStatusCount[];
}

interface TrafficTabProps {
  data: TrafficData;
  onRefresh?: () => Promise<void> | void;
}

/* ============================================================
   API CONFIGURATION
   ============================================================ */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.accqudo.com/api/v1'
).replace(/\/+$/, '');


/* ============================================================
   ALLOWED STATUS CODES
   ============================================================ */

const DELETABLE_STATUSES = [
  200,
  400,
  401,
  403,
  404,
  405,
  422,
  500,
];


/* ============================================================
   AUTHENTICATION
   ============================================================ */

/**
 * Your authentication system stores the JWT as:
 *
 * localStorage.setItem('accqudo_token', data.access_token)
 *
 * The FastAPI backend uses OAuth2PasswordBearer and therefore
 * requires:
 *
 * Authorization: Bearer <JWT>
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token =
      window.localStorage.getItem(
        'accqudo_token',
      );

    if (!token) {
      return null;
    }

    return token.trim();
  } catch {
    return null;
  }
}


/**
 * Build authenticated headers for every protected
 * Super Admin request.
 */
function getAuthHeaders(
  includeJsonContentType = false,
): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (includeJsonContentType) {
    headers['Content-Type'] =
      'application/json';
  }

  const token = getAccessToken();

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}


/* ============================================================
   HELPERS
   ============================================================ */

function getStatusClasses(
  status: number,
) {
  if (
    status >= 200 &&
    status < 300
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (
    status >= 300 &&
    status < 400
  ) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  if (
    status === 400 ||
    status === 422
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (
    status === 401 ||
    status === 403
  ) {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }

  if (
    status === 404 ||
    status === 405
  ) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }

  if (status >= 500) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return 'bg-stone-100 text-stone-700 border-stone-200';
}


function formatTimestamp(
  timestamp?: string | null,
) {
  if (!timestamp) {
    return 'N/A';
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return timestamp;
  }

  return date.toLocaleString();
}


function getStatusCount(
  summary:
    | TrafficStatusCount[]
    | undefined,
  status: number,
) {
  return (
    summary?.find(
      (item) =>
        item.status_code === status,
    )?.count ?? 0
  );
}


/* ============================================================
   COMPONENT
   ============================================================ */

export default function TrafficTab({
  data,
  onRefresh,
}: TrafficTabProps) {

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    deletingStatus,
    setDeletingStatus,
  ] = useState<number | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState<{
    type:
      | 'success'
      | 'error';
    text: string;
  } | null>(null);


  /* ==========================================================
     STATUS SUMMARY
     ========================================================== */

  const statusSummary =
    useMemo(() => {

      return DELETABLE_STATUSES.map(
        (status) => ({
          status_code: status,
          count:
            getStatusCount(
              data.status_summary,
              status,
            ),
        }),
      );

    }, [
      data.status_summary,
    ]);


  /* ==========================================================
     DOWNLOAD COMPLETE LOG
     ========================================================== */

  const handleDownloadLog =
    async () => {

      try {

        setDownloading(true);
        setMessage(null);

        const token =
          getAccessToken();

        if (!token) {
          throw new Error(
            'Authentication token not found. Please sign in again.',
          );
        }


        /**
         * Backend:
         *
         * GET
         * /api/v1/super-admin/traffic/export
         *
         * Requires:
         *
         * Authorization: Bearer <JWT>
         */
        const response =
          await fetch(
            `${API_BASE}/super-admin/traffic/export`,
            {
              method: 'GET',

              headers:
                getAuthHeaders(
                  false,
                ),

              credentials:
                'include',

              cache:
                'no-store',
            },
          );


        if (!response.ok) {

          let errorMessage =
            'Unable to download traffic log.';

          try {

            const errorData =
              await response.json();

            errorMessage =
              errorData?.detail ||
              errorMessage;

          } catch {
            // Response wasn't JSON.
          }


          if (
            response.status ===
            401
          ) {
            errorMessage =
              'Not authenticated (HTTP 401). Please sign in again.';
          }


          if (
            response.status ===
            403
          ) {
            errorMessage =
              'Access denied. Super Admin privileges are required.';
          }


          throw new Error(
            `${errorMessage} (HTTP ${response.status})`,
          );
        }


        /* ====================================================
           DOWNLOAD RESPONSE
           ==================================================== */

        const blob =
          await response.blob();


        let filename =
          'accqudo-traffic-logs.log';

        const contentDisposition =
          response.headers.get(
            'content-disposition',
          );


        if (
          contentDisposition
        ) {

          const match =
            contentDisposition.match(
              /filename="?([^"]+)"?/i,
            );

          if (
            match?.[1]
          ) {
            filename =
              match[1];
          }
        }


        /**
         * Create browser download.
         */
        const downloadUrl =
          window.URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            'a',
          );

        anchor.href =
          downloadUrl;

        anchor.download =
          filename;

        anchor.style.display =
          'none';

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        anchor.remove();


        window.setTimeout(() => {
          window.URL.revokeObjectURL(
            downloadUrl,
          );
        }, 1000);


        setMessage({
          type: 'success',
          text:
            'Complete traffic log downloaded successfully.',
        });

      } catch (
        error
      ) {

        setMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Unable to download traffic log.',
        });

      } finally {

        setDownloading(false);

      }
    };


  /* ==========================================================
     DELETE LOGS BY STATUS
     ========================================================== */

  const handleDeleteStatus =
    async (
      statusCode: number,
    ) => {

      const count =
        getStatusCount(
          data.status_summary,
          statusCode,
        );


      if (count === 0) {

        setMessage({
          type: 'error',
          text:
            `There are no ${statusCode} traffic logs to delete.`,
        });

        return;
      }


      const confirmed =
        window.confirm(
          `Delete ALL ${count.toLocaleString()} ` +
          `traffic log ${
            count === 1
              ? 'record'
              : 'records'
          } with status ${statusCode}?\n\n` +
          `This action cannot be undone.`,
        );


      if (!confirmed) {
        return;
      }


      try {

        setDeletingStatus(
          statusCode,
        );

        setMessage(null);


        const token =
          getAccessToken();


        if (!token) {
          throw new Error(
            'Authentication token not found. Please sign in again.',
          );
        }


        /**
         * Backend:
         *
         * DELETE
         * /api/v1/super-admin/traffic/status/{statusCode}
         *
         * Requires:
         *
         * Authorization: Bearer <JWT>
         */
        const response =
          await fetch(
            `${API_BASE}/super-admin/traffic/status/${statusCode}`,
            {
              method: 'DELETE',

              headers:
                getAuthHeaders(
                  false,
                ),

              credentials:
                'include',

              cache:
                'no-store',
            },
          );


        const result =
          await response
            .json()
            .catch(
              () => null,
            );


        if (!response.ok) {

          let errorMessage =
            result?.detail ||
            `Unable to delete ${statusCode} traffic logs.`;


          if (
            response.status ===
            401
          ) {
            errorMessage =
              'Not authenticated (HTTP 401). Please sign in again.';
          }


          if (
            response.status ===
            403
          ) {
            errorMessage =
              'Access denied. Super Admin privileges are required.';
          }


          throw new Error(
            `${errorMessage} (HTTP ${response.status})`,
          );
        }


        setMessage({
          type: 'success',
          text:
            result?.message ||
            `Deleted ${
              result?.deleted_count ??
              count
            } log records with status ${statusCode}.`,
        });


        /**
         * Refresh parent data.
         */
        if (onRefresh) {
          await onRefresh();
        }

      } catch (
        error
      ) {

        setMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : `Unable to delete ${statusCode} traffic logs.`,
        });

      } finally {

        setDeletingStatus(
          null,
        );

      }
    };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================
          METRICS
      ======================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Total Requests */}

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">

          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">
            Total Captured Requests
          </p>

          <p className="text-3xl font-black text-[#16293F] mt-1">
            {data.total_requests.toLocaleString()}
          </p>

          <p className="text-xs text-stone-400 mt-2">
            Total records currently stored in the traffic table.
          </p>

        </div>


        {/* Unique Visitors */}

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">

          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">
            Unique Visitor IPs
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-1">
            {data.unique_visitors.toLocaleString()}
          </p>

          <p className="text-xs text-stone-400 mt-2">
            Distinct IP addresses captured in traffic logs.
          </p>

        </div>

      </div>


      {/* ======================================================
          MESSAGE
      ======================================================= */}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type ===
            'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}


      {/* ======================================================
          TRAFFIC LOG MANAGEMENT
      ======================================================= */}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Header */}

        <div className="p-5 border-b border-stone-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <h2 className="font-black text-[#16293F] text-base">
                Traffic Log Management
              </h2>

              <p className="text-xs text-stone-500 mt-1">
                Download the complete traffic table
                or remove records by HTTP status code.
              </p>

            </div>


            {/* Download */}

            <button
              type="button"
              onClick={
                handleDownloadLog
              }
              disabled={
                downloading
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16293F] text-white text-xs font-bold hover:bg-[#213c5c] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >

              {downloading ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" />

                  Preparing LOG...
                </>
              ) : (
                <>
                  <span>
                    ↓
                  </span>

                  Download Complete .LOG
                </>
              )}

            </button>

          </div>

        </div>


        {/* ====================================================
            DELETE STATUS SECTION
        ===================================================== */}

        <div className="p-5 bg-stone-50 border-b border-stone-200">

          <div className="mb-4">

            <h3 className="text-xs font-black uppercase tracking-wide text-stone-700">
              Delete Logs by Status
            </h3>

            <p className="text-[11px] text-stone-500 mt-1">
              Each button deletes only the selected
              HTTP status. Deletion is permanent.
            </p>

          </div>


          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">

            {statusSummary.map(
              (item) => {

                const status =
                  item.status_code;

                const count =
                  item.count;

                const deleting =
                  deletingStatus ===
                  status;


                return (
                  <button
                    key={
                      status
                    }
                    type="button"
                    onClick={() =>
                      handleDeleteStatus(
                        status,
                      )
                    }
                    disabled={
                      deleting ||
                      count === 0
                    }
                    className={`group rounded-xl border p-3 text-left transition ${
                      count === 0
                        ? 'bg-white border-stone-200 opacity-50 cursor-not-allowed'
                        : 'bg-white hover:bg-stone-100 border-stone-200'
                    }`}
                  >

                    <div className="flex items-center justify-between gap-2">

                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${getStatusClasses(
                          status,
                        )}`}
                      >
                        {status}
                      </span>


                      {deleting && (
                        <span className="animate-spin h-3 w-3 rounded-full border border-stone-300 border-t-stone-700" />
                      )}

                    </div>


                    <p className="text-lg font-black text-[#16293F] mt-2">
                      {count.toLocaleString()}
                    </p>

                    <p className="text-[10px] text-stone-400">
                      {count ===
                      1
                        ? 'record'
                        : 'records'}
                    </p>

                  </button>
                );
              },
            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          LIVE TRAFFIC STREAM
      ======================================================= */}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Header */}

        <div className="p-4 border-b border-stone-200 bg-stone-50">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>

              <div className="font-bold text-xs text-stone-700">
                Live Traffic Stream &amp; Metadata
              </div>

              <div className="text-[10px] text-stone-400 mt-1">
                Showing latest{' '}
                {data.logs.length.toLocaleString()}{' '}
                records.
              </div>

            </div>


            {data.logs.length >
              0 && (
              <span className="text-[10px] font-bold text-emerald-600">
                ● STREAM ACTIVE
              </span>
            )}

          </div>

        </div>


        {/* Table */}

        <div className="overflow-x-auto max-h-[600px]">

          <table className="w-full text-left border-collapse text-xs">

            <thead className="sticky top-0 z-10">

              <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 font-mono">

                <th className="p-3 whitespace-nowrap">
                  ID
                </th>

                <th className="p-3 whitespace-nowrap">
                  Method / Path
                </th>

                <th className="p-3 whitespace-nowrap">
                  Status
                </th>

                <th className="p-3 whitespace-nowrap">
                  Client IP
                </th>

                <th className="p-3 whitespace-nowrap">
                  Latency
                </th>

                <th className="p-3 min-w-[260px]">
                  User Agent
                </th>

                <th className="p-3 whitespace-nowrap">
                  Timestamp
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">

              {data.logs.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="p-10 text-center text-stone-400"
                  >
                    No traffic logs found.
                  </td>

                </tr>

              ) : (

                data.logs.map(
                  (log) => (

                    <tr
                      key={
                        log.id
                      }
                      className="hover:bg-stone-50 transition"
                    >

                      {/* ID */}

                      <td className="p-3 text-stone-400">
                        #{log.id}
                      </td>


                      {/* METHOD / PATH */}

                      <td className="p-3">

                        <div className="flex items-start gap-2">

                          <span
                            className={`px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              log.method ===
                              'GET'
                                ? 'bg-blue-50 text-blue-700'
                                : log.method ===
                                  'POST'
                                ? 'bg-emerald-50 text-emerald-700'
                                : log.method ===
                                  'DELETE'
                                ? 'bg-rose-50 text-rose-700'
                                : log.method ===
                                  'PUT'
                                ? 'bg-amber-50 text-amber-700'
                                : log.method ===
                                  'PATCH'
                                ? 'bg-purple-50 text-purple-700'
                                : log.method ===
                                  'OPTIONS'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {
                              log.method
                            }
                          </span>


                          <span
                            className="text-stone-800 font-semibold break-all"
                            title={
                              log.path
                            }
                          >
                            {
                              log.path
                            }
                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td className="p-3">

                        <span
                          className={`px-2 py-0.5 rounded border font-bold ${getStatusClasses(
                            log.status_code,
                          )}`}
                        >
                          {
                            log.status_code
                          }
                        </span>

                      </td>


                      {/* IP */}

                      <td className="p-3 text-stone-600 whitespace-nowrap">
                        {
                          log.ip_address ||
                          'N/A'
                        }
                      </td>


                      {/* LATENCY */}

                      <td className="p-3 whitespace-nowrap">

                        <span
                          className={
                            log.response_time_ms >=
                            1000
                              ? 'text-rose-600 font-bold'
                              : log.response_time_ms >=
                                500
                              ? 'text-amber-600 font-bold'
                              : 'text-stone-600'
                          }
                        >
                          {Number(
                            log.response_time_ms ||
                              0,
                          ).toFixed(
                            2,
                          )}{' '}
                          ms
                        </span>

                      </td>


                      {/* USER AGENT */}

                      <td
                        className="p-3 text-stone-400 max-w-md truncate"
                        title={
                          log.user_agent ||
                          ''
                        }
                      >
                        {
                          log.user_agent ||
                          'N/A'
                        }
                      </td>


                      {/* TIMESTAMP */}

                      <td className="p-3 text-stone-400 whitespace-nowrap">
                        {formatTimestamp(
                          log.timestamp,
                        )}
                      </td>

                    </tr>

                  ),
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}