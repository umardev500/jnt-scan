import type { RecordItem } from "../types/report";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

interface Props {
  data: RecordItem[];
  printedList: string[];
  onAddToPrintedList?: (item: RecordItem) => void;
  onRemoveFromPrintedList?: (shipmentNo: string) => void;
}

const columnHelper = createColumnHelper<RecordItem>();

export default function ReportTable({ data, printedList, onAddToPrintedList, onRemoveFromPrintedList }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "plannedDepartureTime", desc: false },
  ]);

  const getTimeStatus = (
    actualTime?: string | null,
    plannedTime?: string | null
  ) => {
    if (!actualTime || !plannedTime) return "normal";

    const actual = new Date(actualTime).getTime();
    const planned = new Date(plannedTime).getTime();

    // Late
    if (actual > planned) return "late";

    // Within 15 minutes before cutoff
    const diffMinutes = (planned - actual) / (1000 * 60);

    if (diffMinutes <= 15) return "warning";

    return "normal";
  };

  const getDepartureStatus = (plannedTime?: string | null) => {
    if (!plannedTime) return "normal";

    const now = Date.now();
    const planned = new Date(plannedTime).getTime();

    const diffMinutes = (planned - now) / (1000 * 60);

    if (diffMinutes < 0) return "late";

    if (diffMinutes <= 10) return "danger";

    if (diffMinutes <= 15) return "warningDanger";

    if (diffMinutes <= 20) return "warning";

    return "normal";
  };

  const columns = useMemo(
    () => [
      // ROW COUNTER - NOT SORTABLE
      {
        id: "rowNumber",
        header: "No",
        enableSorting: false,
        cell: () => null, // placeholder, actual counter is in tbody
      },
      columnHelper.accessor("shipmentNo", {
        header: "Shipment No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("driverName", {
        header: "Driver",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("carrierName", {
        header: "Carrier",
        cell: (info) => {
          const value = info.getValue();

          return value
            .replace(/^PT\.?\s*/i, "") // Remove "PT." or "PT"
            .split(/\s+/)
            .map((word) => word[0])
            .join("");
        },
      }),
      columnHelper.accessor("plateNumber", {
        header: "Plate Number",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("vehicletypeName", {
        header: "Vehicle Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("arriveNetworkCode", {
        header: "Destination",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("plannedDepartureTime", {
        header: "Planned Departure",
        cell: (info) => {
          const planned = info.getValue();

          const scanTime = info.row.original.trackOutTime;
          const appDeparture = info.row.original.appTrackDepartureTime;

          // 🚫 STOP WARNING ONLY IF BOTH ARE FILLED
          const isCompleted = Boolean(scanTime && appDeparture);

          if (!planned) {
            return (
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-sm">
                -
              </span>
            );
          }

          // 🟢 Completed state (NO warning anymore)
          if (isCompleted) {
            return (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-lg text-sm">
                {new Date(planned).toLocaleString()}
              </span>
            );
          }

          // ⏱ ACTIVE WARNING (only if NOT completed)
          const status = getDepartureStatus(planned);

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-lg text-sm ${status === "late"
                ? "bg-red-200 text-red-800"
                : status === "danger"
                  ? "bg-red-100 text-red-800 animate-pulse"
                  : status === "warningDanger"
                    ? "bg-orange-100 text-orange-800 animate-pulse"
                    : status === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-700"
                }`}
            >
              {new Date(planned).toLocaleString()}
            </span>
          );
        },
      }),
      // columnHelper.accessor("plannedDepartureTime", {
      //   header: "Planned Departure",
      //   cell: (info) =>
      //     info.getValue()
      //       ? new Date(info.getValue()).toLocaleString()
      //       : "-",
      // }),
      // columnHelper.accessor("appTrackDepartureTime", {
      //   id: "appDepartureTime",
      //   header: "App Departure",
      //   cell: (info) => {
      //     const value = info.getValue();
      //     if (!value)
      //       return (
      //         <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
      //           - -
      //         </span>
      //       );
      //     return new Date(value).toLocaleString();
      //   },
      // }),
      columnHelper.accessor("appTrackDepartureTime", {
        id: "appDepartureTime",
        header: "App Departure",
        cell: (info) => {
          const value = info.getValue();
          const plannedDeparture =
            info.row.original.plannedDepartureTime;

          if (!value)
            return (
              <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
                - -
              </span>
            );

          const status = getTimeStatus(value, plannedDeparture);

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-lg text-sm ${status === "late"
                ? "bg-red-100 text-red-800"
                : status === "warning"
                  ? "bg-yellow-100 text-yellow-800 animate-pulse"
                  : ""
                }`}
            >
              {new Date(value).toLocaleString()}
            </span>
          );
        },
      }),
      // columnHelper.accessor("trackOutTime", {
      //   id: "scanTime",
      //   header: "Scan Time",
      //   cell: (info) => {
      //     const value = info.getValue();
      //     if (!value)
      //       return (
      //         <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
      //           - -
      //         </span>
      //       );
      //     return new Date(value).toLocaleString();
      //   },
      // }),
      columnHelper.accessor("trackOutTime", {
        id: "scanTime",
        header: "Scan Time",
        cell: (info) => {
          const value = info.getValue();
          const plannedDeparture =
            info.row.original.plannedDepartureTime;

          if (!value)
            return (
              <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
                - -
              </span>
            );

          const status = getTimeStatus(value, plannedDeparture);

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-lg text-sm ${status === "late"
                ? "bg-red-100 text-red-800"
                : status === "warning"
                  ? "bg-yellow-100 text-yellow-800 animate-pulse"
                  : ""
                }`}
            >
              {new Date(value).toLocaleString()}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          // const added = printedList.some(
          //   (x) => x.shipmentNo === row.original.shipmentNo
          // );

          const added = printedList.includes(row.original.shipmentNo);

          return (
            <button
              onClick={() => {
                if (added) {
                  onRemoveFromPrintedList?.(row.original.shipmentNo);
                } else {
                  onAddToPrintedList?.(row.original);
                }
              }}
              className={`rounded w-8 h-8 text-xs font-medium text-white ${added
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {added ? "⃠" : "✓"}
            </button>
          );
        },
      }),
    ],
    [printedList, onAddToPrintedList]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getUpColor = (state: false | "asc" | "desc") =>
    state === "asc" ? "text-blue-600" : "text-gray-300";
  const getDownColor = (state: false | "asc" | "desc") =>
    state === "desc" ? "text-blue-600" : "text-gray-300";

  return (
    <div className="overflow-x-auto border border-gray-300 bg-white">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const sortState = header.column.getIsSorted();
                const isNumberCol = header.id === "rowNumber";
                const isActionCol = header.id === "action";
                return (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`border border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-700 text-nowrap ${header.column.getCanSort() ? "cursor-pointer" : "cursor-default"
                      } ${isNumberCol ? "sticky left-0 bg-gray-100 z-20" : ""} ${isActionCol ? "sticky right-0 bg-gray-100 z-20" : ""} ${isActionCol ? "hidden lg:table-cell" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="flex flex-col text-[10px] leading-none">
                          <span className={getUpColor(sortState as any)}>▲</span>
                          <span className={getDownColor(sortState as any)}>▼</span>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              className="border border-gray-200 transition-colors duration-150 hover:bg-gray-100"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`border border-gray-200 px-6 py-2.5 text-sm text-gray-700 whitespace-nowrap ${cell.column.id === "rowNumber" ? "sticky left-0 bg-gray-50 z-10" : ""
                    } ${cell.column.id === "action"
                      ? "sticky right-0 bg-white z-10"
                      : ""
                    } ${cell.column.id === "action" ? "hidden lg:table-cell" : ""}`}
                >
                  {cell.column.id === "rowNumber"
                    ? idx + 1 // COUNTER OUTSIDE DATA, safe for filtered/sorted
                    : flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}