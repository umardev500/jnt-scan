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
}

const columnHelper = createColumnHelper<RecordItem>();

export default function ReportTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "plannedDepartureTime", desc: false },
  ]);

  const columns = useMemo(
    () => [
      // NUMBERING COLUMN - NOT SORTABLE, COUNTER GENERATED IN RENDER
      {
        id: "rowNumber",
        header: "No",
        enableSorting: false,
        cell: (_info, rowIndex: number) => rowIndex + 1,
      },
      columnHelper.accessor("shipmentNo", {
        header: "Shipment No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("driverName", {
        header: "Driver",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("plateNumber", {
        header: "Plate Number",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("arriveNetworkCode", {
        header: "Destination",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("plannedDepartureTime", {
        header: "Planned Departure",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleString()
            : "-",
      }),
      columnHelper.accessor("appTrackDepartureTime", {
        id: "appDepartureTime",
        header: "App Departure",
        cell: (info) => {
          const value = info.getValue();
          if (!value)
            return (
              <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
                - -
              </span>
            );
          return new Date(value).toLocaleString();
        },
      }),
      columnHelper.accessor("appTrackDepartureTime", {
        id: "scanTime",
        header: "Scan Time",
        cell: (info) => {
          const value = info.getValue();
          if (!value)
            return (
              <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-lg text-sm">
                - -
              </span>
            );
          return new Date(value).toLocaleString();
        },
      }),
    ],
    []
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
                return (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`border border-gray-300 px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                      header.column.getCanSort() ? "cursor-pointer" : "cursor-default"
                    } ${isNumberCol ? "sticky left-0 bg-gray-100 z-20" : ""}`}
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
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className={`border border-gray-200 px-6 py-4 text-sm text-gray-700 whitespace-nowrap ${
                    cell.column.id === "rowNumber" ? "sticky left-0 bg-gray-50 z-10" : ""
                  }`}
                >
                  {cell.column.id === "rowNumber"
                    ? idx + 1 // COUNTER OUTSIDE DATA
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