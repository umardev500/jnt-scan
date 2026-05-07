import { useEffect, useState } from "react";
import { getReports } from "../api/report.api";
import type { RecordItem } from "../types/report";
import type { ReportFilter } from "../types/reportFilter";
import { useApi } from "../context/ApiContext";

export const useReport = (filters: ReportFilter) => {
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiUrl } = useApi();

  const fetchReports = async (params: ReportFilter) => {
    // ❌ Guard: don't fetch if apiUrl is empty
    if (!apiUrl) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        current: 1,
        size: 100,
        shipmentState: params.shipmentState,
        tmsType: 1,
        sendNetworkCode: "BTN777",
        timeType: 2,
        startTime: params.startTime,
        endTime: params.endTime,
        countryId: "1",
        shipmentName: params.shipmentName,
      };

      const response = await getReports(payload, apiUrl);

      setData(response.data.records);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Run only when filters change AND apiUrl is set
  useEffect(() => {
    if (!apiUrl) return; // ❌ skip if no URL yet
    fetchReports(filters);
  }, [filters, apiUrl]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchReports(filters),
  };
};