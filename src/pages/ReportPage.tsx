import { useState } from "react";
import ReportTable from "../components/ReportTable";
import { useReport } from "../hooks/useReport";
import type { ReportFilter } from "../types/reportFilter";
import { formatRaw } from "../helpers/time";
import { useApi } from "../context/ApiContext";
import loadingAnimation from "../assets/loading.lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


export default function ReportPage() {
  // =========================
  // API CONTEXT
  // =========================
  const { apiUrl, setApiUrl } = useApi();

  const defaultReportFilter: ReportFilter = {
    shipmentState: 3,
    startTime: formatRaw("2026-05-19T08:00"),
    endTime: formatRaw("2026-05-20T20:00"),
  };


  // =========================
  // INPUT STATE (typing only)
  // =========================
  const [filters, setFilters] = useState<ReportFilter>(
    defaultReportFilter
  );

  // =========================
  // APPLIED STATE (API trigger)
  // =========================
  const [appliedFilters, setAppliedFilters] =
    useState<ReportFilter>(defaultReportFilter);

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


  return (
    <div className="min-h-screen bg-gray-50">

      {/* =========================
          HEADER + API INPUT FORM
          ========================= */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-6 flex flex-col gap-4">

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
              className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 text-nowrap"
            >
              Set URL
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CONTENT
          ========================= */}
      <div className="mx-auto max-w-[1600px] px-6 py-6">

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* FILTER BAR */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-wrap gap-4">

              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-1">
                <label className="text-xs text-gray-500 sm:mr-2 sm:whitespace-nowrap">
                  Shipment Name
                </label>
                <input
                  type="text"
                  name="shipmentName"
                  value={filters.shipmentName || ""}
                  onChange={handleChange}
                  placeholder="Enter shipment name"
                  className="mt-1 sm:mt-0 w-full sm:w-40 rounded border px-3 py-2 text-sm"
                />
              </div>

              {/* Shipment State */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-1">
                <label className="text-xs text-gray-500 sm:mr-2 sm:whitespace-nowrap">
                  Shipment State
                </label>
                <select
                  name="shipmentState"
                  value={filters.shipmentState}
                  onChange={handleChange}
                  className="mt-1 sm:mt-0 w-full sm:w-40 rounded border px-3 py-2 text-sm"
                >
                  <option value={2}>Menunggu Proses</option>
                  <option value={3}>Dalam Perjalanan</option>
                </select>
              </div>

              {/* Start Time */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-1">
                <label className="text-xs text-gray-500 sm:mr-2 sm:whitespace-nowrap">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={filters.startTime}
                  onChange={handleChange}
                  className="mt-1 sm:mt-0 w-full sm:w-40 rounded border px-3 py-2 text-sm"
                  style={{ minWidth: "195px" }}
                />
              </div>

              {/* End Time */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-1">
                <label className="text-xs text-gray-500 sm:mr-2 sm:whitespace-nowrap">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={filters.endTime}
                  onChange={handleChange}
                  className="mt-1 sm:mt-0 w-full sm:w-40 rounded border px-3 py-2 text-sm min-w-43.75"
                  style={{ minWidth: "195px" }}
                />
              </div>

              {/* SEARCH BUTTON */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                <button
                  onClick={handleSearch}
                  className="w-full sm:w-auto rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

            </div>
          </div>

          <div className="p-2 relative">

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                {/* Tambahkan aspect-square atau h-40 di sini 👇 */}
                <div className="w-80 flex items-center justify-center">
                  <DotLottieReact
                    src={loadingAnimation}
                    loop
                    autoplay
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <ReportTable data={data || []} />
          </div>

        </div>
      </div>
    </div>
  );
}