import type { VehicleCheckResult } from "../types/report";

type Props = {
  open: boolean;
  onClose: () => void;
  results: VehicleCheckResult[];
};

export default function VehicleCheckModal({
  open,
  onClose,
  results,
}: Props) {
  if (!open) return null;

  const total = results.length;
  const found = results.filter((r) => r.found).length;
  const notFound = total - found;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Vehicle Validation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Check result for shipment vehicles
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 px-8 pb-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {total}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-xs uppercase tracking-wide text-green-600">
              Matched
            </p>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {found}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs uppercase tracking-wide text-red-600">
              Not Found
            </p>
            <p className="mt-2 text-3xl font-semibold text-red-700">
              {notFound}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="border-t border-gray-100 mb-6">
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Shipment
                  </th>

                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plate Number
                  </th>

                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Vehicle Type
                  </th>

                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {results.map((item) => (
                  <tr
                    key={`${item.shipmentNo}-${item.plateNumber}`}
                    className="border-b border-gray-50 transition hover:bg-gray-50"
                  >
                    <td className="px-8 py-4">
                      <div className="font-medium text-gray-900">
                        {item.shipmentNo}
                      </div>
                    </td>

                    <td className="px-8 py-4 text-gray-700">
                      {item.plateNumber}
                    </td>

                    <td className="px-8 py-4 text-gray-700">
                      {item.vehicleType}
                    </td>

                    <td className="px-8 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          item.found
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span
                          className={`mr-2 h-2 w-2 rounded-full ${
                            item.found
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {item.found ? "Matched" : "Not Found"}
                      </span>

                      {(item.status && !item.found) && (
                        <div className="mt-1 text-xs text-gray-500">
                          {item.status}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {results.length === 0 && (
              <div className="flex h-40 items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}