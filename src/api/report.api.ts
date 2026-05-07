import type { ApiResponse } from "../types/report";
import type { RequestPayload } from "../types/requestPayload";
import axios from "axios";

export const getReports = async (
  payload: RequestPayload,
  apiUrl?: string
): Promise<ApiResponse> => {
  const response = await axios.post(
    `${apiUrl}/report`,
    payload
  );

  return response.data;
};