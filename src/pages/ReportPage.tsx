import { useEffect, useState } from "react";
import ReportTable from "../components/ReportTable";
import { useReport } from "../hooks/useReport";
import type { ReportFilter } from "../types/reportFilter";
import { formatRaw } from "../helpers/time";
import { useApi } from "../context/ApiContext";
import loadingAnimation from "../assets/loading.lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { RecordItem, VehicleCheckPayload, VehicleCheckResult } from "../types/report";
import VehicleCheckModal from "../components/VehicleModal";
import useDarkMode from "../hooks/useDarkMode";


export default function ReportPage() {
  // =========================
  // API CONTEXT
  // =========================
  const { apiUrl, setApiUrl } = useApi();

  // const defaultReportFilter: ReportFilter = { shipmentState: 3, startTime: formatRaw("2026-08-12T08:00"), endTime: formatRaw("2026-08-13T10:00"), };
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");

  const defaultReportFilter: ReportFilter = {
    shipmentState: 3,
    startTime: formatRaw(`${date}T00:00`),
    endTime: formatRaw(`${nextDate}T23:59`),
  };


  const [vehicleResults, setVehicleResults] = useState<
    VehicleCheckResult[]
  >([]);

  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const [checkingVehicle, setCheckingVehicle] = useState(false);

  // const [printedList, setPrintedList] = useState<RecordItem[]>([]);
  const [printedList, setPrintedList] = useState<string[]>(() => {
    const saved = localStorage.getItem("printedList");

    if (!saved) return [];

    try {
      return JSON.parse(saved) as string[];
    } catch {
      return [];
    }
  });


  const { toggleDarkMode, isDarkMode } = useDarkMode();


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

  const [driverFilter, setDriverFilter] = useState("");
  const [printedFilter, setPrintedFilter] = useState("");

  const filteredData = data.filter((item) => {
    const driverName = item.driverName.trim().toUpperCase();
    const plateNumber = item.plateNumber.trim().toUpperCase();
    const isPrinted = printedList.includes(item.shipmentNo);

    // Always include this plate number
    if (plateNumber === "B1234HQ") {
      return true;
    }

    if (driverFilter === "TEMBAKAN") {
      return driverName === "TEMBAKAN";
    }

    if (driverFilter === "EXCLUDE_TEMBAKAN") {
      return driverName !== "TEMBAKAN";
    }

    // Printed filter
    if (printedFilter === "PRINTED") {
      if (!isPrinted) return false;
    }

    if (printedFilter === "UNPRINTED") {
      if (isPrinted) return false;
    }

    return true;
  });
  // =========================
  // INPUT CHANGE (NO FETCH)
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: name === "shipmentState" ? Number(value) : name === "shipmentName"
        ? value.toUpperCase()
        : value,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };


  const handleCheckVehicle = async () => {
    const payload: VehicleCheckPayload[] = data.map((item) => ({
      shipmentNo: item.shipmentNo,
      plateNumber: item.plateNumber,
      vehicleType: item.vehicletypeName,
    }));

    try {
      setCheckingVehicle(true);

      const res = await fetch(`${apiUrl}/check-vehicle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to check vehicle");
      }

      const result = await res.json();

      setVehicleResults(result.data ?? []);
      setShowVehicleModal(true);
    } catch (err) {
      console.error("Failed to check vehicle:", err);
    } finally {
      setCheckingVehicle(false);
    }
  };

  const handleAddToPrintedList = (item: RecordItem) => {
    setPrintedList((prev) =>
      prev.includes(item.shipmentNo)
        ? prev
        : [...prev, item.shipmentNo]
    );
  };

  const handleRemoveFromPrintedList = (shipmentNo: string) => {
    setPrintedList((prev) => prev.filter((x) => x !== shipmentNo));
  };

  useEffect(() => {
    console.log("printedList updated:", printedList);
  }, [printedList]);

  useEffect(() => {
    localStorage.setItem(
      "printedList",
      JSON.stringify(printedList)
    );
  }, [printedList]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* =========================
          HEADER + API INPUT FORM
          ========================= */}

      <div className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-[1700px] px-6 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-center">

            {/* LEFT: TITLE + API */}
            <div className="min-w-0">

              {/* TITLE */}
              <div className="mb-4 flex items-center gap-3">

                {/* LOGO */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-purple-200/50 dark:shadow-purple-950/30">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />

                  <span className="relative text-base font-bold text-white">
                    R
                  </span>
                </div>

                {/* TITLE */}
                <div>
                  <div className="flex items-center gap-2">

                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      Report Dashboard
                    </h1>

                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      v2
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Shipment overview and operational data
                  </p>
                </div>
              </div>

              {/* API CONNECTION */}
              <div className="flex w-full max-w-3xl flex-col gap-2 sm:flex-row">

                <div className="relative flex-1">

                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    API
                  </span>

                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com"
                    className="
                h-10 w-full rounded-lg
                border border-gray-200
                bg-gray-50
                pl-12 pr-3
                text-sm text-gray-700
                outline-none
                transition

                placeholder:text-gray-400

                hover:border-gray-300

                focus:border-gray-400
                focus:bg-white
                focus:ring-2
                focus:ring-gray-100

                dark:border-gray-700
                dark:bg-gray-900
                dark:text-gray-200
                dark:placeholder:text-gray-600

                dark:hover:border-gray-600

                dark:focus:border-gray-500
                dark:focus:bg-gray-900
                dark:focus:ring-gray-800
              "
                  />
                </div>

                <button
                  onClick={() => console.log("API URL set:", apiUrl)}
                  className="
              h-10 rounded-lg
              bg-gray-900
              px-5
              text-sm font-medium text-white
              transition

              hover:bg-gray-800
              active:bg-gray-950

              dark:bg-white
              dark:text-gray-900
              dark:hover:bg-gray-100
              dark:active:bg-gray-200
            "
                >
                  Connect
                </button>

              </div>
            </div>

            {/* RIGHT: DEVELOPER + THEME */}
            <div
              className="
          flex items-center gap-4
          border-t border-gray-100
          pt-4

          lg:border-l
          lg:border-t-0
          lg:pl-6
          lg:pt-0

          dark:border-gray-800
        "
            >

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={
                  isDarkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={isDarkMode ? "Light mode" : "Dark mode"}
                className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-lg
            border border-gray-200
            bg-white
            text-gray-600
            shadow-sm
            transition

            hover:bg-gray-50
            hover:text-gray-900

            dark:border-gray-700
            dark:bg-gray-900
            dark:text-gray-300

            dark:hover:border-gray-600
            dark:hover:bg-gray-800
            dark:hover:text-white
          "
              >
                {isDarkMode ? (
                  /* Sun */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  /* Moon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Avatar */}
              <div className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-full
          bg-gray-900
          text-sm font-semibold text-white

          dark:bg-white
          dark:text-gray-900
        ">
                U
              </div>

              {/* Developer Info */}
              <div className="min-w-0">

                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Umar Schweinsteiger
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Software Engineer · Tech Enthusiast
                </p>

                <a
                  href="https://umardev500.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
              mt-0.5
              inline-flex
              items-center
              gap-1
              text-xs
              font-medium
              text-gray-400
              transition

              hover:text-gray-700

              dark:text-gray-500
              dark:hover:text-gray-300
            "
                >
                  Portfolio
                  <span aria-hidden="true">↗</span>
                </a>

              </div>
            </div>

          </div>
        </div>
      </div>


      {/* =========================
          CONTENT
          ========================= */}

      <div className="mx-auto max-w-[1700px] px-6 py-6">

        <div className="
    overflow-hidden
    rounded-xl
    border border-gray-200
    bg-white
    shadow-sm
    transition-colors
    dark:border-gray-800
    dark:bg-gray-900
  ">

          {/* FILTER BAR */}
          <div className="
      border-b border-gray-200
      bg-white
      p-4
      shadow-sm

      md:sticky
      md:top-0
      md:z-30

      dark:border-gray-800
      dark:bg-gray-900
    ">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap items-end gap-3 xl:flex-nowrap">

                {/* Shipment Name */}
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Shipment Name
                  </label>

                  <input
                    type="text"
                    name="shipmentName"
                    value={filters.shipmentName || ""}
                    onChange={handleChange}
                    placeholder="Shipment name"
                    className="
                w-full
                min-w-0
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                uppercase
                text-gray-900
                outline-none
                transition

                placeholder:text-gray-400

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100
                dark:placeholder:text-gray-600

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20
              "
                  />
                </div>

                {/* Shipment State */}
                <div className="w-full sm:w-44 xl:w-44 xl:shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Shipment State
                  </label>

                  <select
                    name="shipmentState"
                    value={filters.shipmentState}
                    onChange={handleChange}
                    className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                text-gray-900
                outline-none
                transition

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20
              "
                  >
                    <option value={1}>Terjadwal</option>
                    <option value={2}>Menunggu Proses</option>
                    <option value={3}>Dalam Perjalanan</option>
                    <option value={4}>Lengkap</option>
                    <option value={5}>Dihapuskan</option>
                  </select>
                </div>

                {/* Driver */}
                <div className="w-full sm:w-40 xl:w-40 xl:shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Driver
                  </label>

                  <select
                    value={driverFilter}
                    onChange={(e) => setDriverFilter(e.target.value)}
                    className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                text-gray-900
                outline-none
                transition

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20
              "
                  >
                    <option value="">All Drivers</option>
                    <option value="TEMBAKAN">TEMBAKAN Only</option>
                    <option value="EXCLUDE_TEMBAKAN">
                      Exclude TEMBAKAN
                    </option>
                  </select>
                </div>

                {/* Printed */}
                <div className="w-full sm:w-36 xl:w-36 xl:shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Printed
                  </label>

                  <select
                    value={printedFilter}
                    onChange={(e) => setPrintedFilter(e.target.value)}
                    className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                text-gray-900
                outline-none
                transition

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20
              "
                  >
                    <option value="">All</option>
                    <option value="UNPRINTED">Unprinted</option>
                    <option value="PRINTED">Printed</option>
                  </select>
                </div>

                {/* Start Time */}
                <div className="w-full sm:w-48 xl:w-48 xl:shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Start Time
                  </label>

                  <input
                    type="datetime-local"
                    name="startTime"
                    value={filters.startTime}
                    onChange={handleChange}
                    className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                text-gray-900
                outline-none
                transition

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20

                dark:[color-scheme:dark]
              "
                  />
                </div>

                {/* End Time */}
                <div className="w-full sm:w-48 xl:w-48 xl:shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    End Time
                  </label>

                  <input
                    type="datetime-local"
                    name="endTime"
                    value={filters.endTime}
                    onChange={handleChange}
                    className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                text-gray-900
                outline-none
                transition

                hover:border-gray-400

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100

                dark:border-gray-700
                dark:bg-gray-950
                dark:text-gray-100

                dark:hover:border-gray-600

                dark:focus:border-blue-500
                dark:focus:ring-blue-500/20

                dark:[color-scheme:dark]
              "
                  />
                </div>

                {/* Actions */}
                <div className="flex w-full gap-2 sm:w-auto xl:shrink-0">

                  {/* Search */}
                  <button
                    type="submit"
                    className="
                h-[38px]
                flex-1
                rounded-lg
                bg-blue-600
                px-5
                text-sm
                font-medium
                text-white
                transition

                hover:bg-blue-700
                active:bg-blue-800

                dark:bg-blue-600
                dark:hover:bg-blue-500
                dark:active:bg-blue-700

                sm:flex-none
              "
                  >
                    Search
                  </button>

                  {/* Check Vehicle */}
                  <button
                    type="button"
                    onClick={handleCheckVehicle}
                    disabled={checkingVehicle}
                    className="
                h-[38px]
                flex-1
                whitespace-nowrap
                rounded-lg
                bg-green-600
                px-5
                text-sm
                font-medium
                text-white
                transition

                hover:bg-green-700
                active:bg-green-800

                disabled:cursor-not-allowed
                disabled:opacity-50

                dark:bg-green-600
                dark:hover:bg-green-500
                dark:active:bg-green-700

                sm:flex-none
              "
                  >
                    {checkingVehicle ? "Checking..." : "Check Vehicle"}
                  </button>

                </div>
              </div>
            </form>
          </div>

          {/* TABLE CONTENT */}
          <div className="relative p-2">

            {/* Loading Overlay */}
            {loading && (
              <div className="
          absolute
          inset-0
          z-20
          flex
          items-center
          justify-center
          bg-white/70
          backdrop-blur-[1px]

          dark:bg-gray-950/70
        ">
                <div className="flex w-80 items-center justify-center">
                  <DotLottieReact
                    src={loadingAnimation}
                    loop
                    autoplay
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="
          rounded-lg
          p-4
          text-sm
          text-red-500

          dark:text-red-400
        ">
                {error}
              </div>
            )}

            <ReportTable
              printedList={printedList}
              data={filteredData || []}
              onAddToPrintedList={handleAddToPrintedList}
              onRemoveFromPrintedList={handleRemoveFromPrintedList}
            />

          </div>

        </div>
      </div>



      <VehicleCheckModal
        open={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        results={vehicleResults}
      />


      <div className="mb-4 border-t border-gray-100 dark:border-gray-800 px-4 py-5 text-center font-['Roboto']">
        <p className="text-sm font-medium text-gray-400">
          © 2026 <span className="text-gray-600">Umar</span>
          <span className="mx-2 text-gray-300">•</span>
          All rights reserved.
        </p>
      </div>
    </div>
  );
}