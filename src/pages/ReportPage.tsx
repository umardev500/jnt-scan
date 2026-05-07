import { useState } from "react";
import ReportTable from "../components/ReportTable";
import { useReport } from "../hooks/useReport";
import type { ReportFilter } from "../types/reportFilter";
import { formatRaw } from "../helpers/time";
import { useApi } from "../context/ApiContext";

export default function ReportPage() {
  // =========================
  // API CONTEXT
  // =========================
  const { apiUrl, setApiUrl } = useApi();

  // =========================
  // INPUT STATE (typing only)
  // =========================
  const [filters, setFilters] = useState<ReportFilter>({
    shipmentState: 3,
    startTime: formatRaw("2026-05-07T10:00"),
    endTime: formatRaw("2026-05-08T20:00"),
  });

  // =========================
  // APPLIED STATE (API trigger)
  // =========================
  const [appliedFilters, setAppliedFilters] =
    useState<ReportFilter>({
      shipmentState: 3,
      startTime: formatRaw("2026-05-07T10:00"),
      endTime: formatRaw("2026-05-08T20:00"),
    });

  // =========================
  // FETCH DATA (guarded)
  // =========================
  const {
    data = [],
    loading,
    error,
  } = useReport(appliedFilters);

  // =========================
  // INPUT CHANGE (NO FETCH)
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: name === "shipmentState" ? Number(value) : value,
    }));
  };

  // =========================
  // SEARCH BUTTON
  // =========================
  const handleSearch = () => {
    setAppliedFilters({
      ...filters,
      startTime: formatRaw(filters.startTime),
      endTime: formatRaw(filters.endTime),
    });
  };

  // =========================
  // Prevent render if API URL not ready
  // =========================
  if (!apiUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Waiting for API configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================
          HEADER + API INPUT FORM
          ========================= */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-4">

          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Report Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Shipment overview and operational data
            </p>
          </div>

          {/* API URL FORM */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Enter API URL (e.g. https://api.example.com)"
              className="w-105 rounded border px-3 py-2 text-sm"
            />

            <button
              onClick={() => console.log("API URL set:", apiUrl)}
              className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            >
              Set URL
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CONTENT
          ========================= */}
      <div className="mx-auto max-w-7xl px-6 py-6">

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* FILTER BAR */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-wrap items-end gap-4">

              {/* Shipment State */}
              <div>
                <label className="text-xs text-gray-500">
                  Shipment State
                </label>
                <select
                  name="shipmentState"
                  value={filters.shipmentState}
                  onChange={handleChange}
                  className="mt-1 w-40 rounded border px-3 py-2 text-sm"
                >
                  <option value={2}>State 2</option>
                  <option value={3}>State 3</option>
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="text-xs text-gray-500">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={filters.startTime}
                  onChange={handleChange}
                  className="mt-1 rounded border px-3 py-2 text-sm"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="text-xs text-gray-500">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={filters.endTime}
                  onChange={handleChange}
                  className="mt-1 rounded border px-3 py-2 text-sm"
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                onClick={handleSearch}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Search
              </button>

            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="p-4 text-sm text-gray-500">
              Loading report...
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* TABLE */}
          {!loading && !error && (
            <div className="p-2">
              <ReportTable data={data || []} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}