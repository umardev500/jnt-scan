export type ReportFilter = {
  shipmentState: 2 | 3; // only allowed values
  startTime: string;
  endTime: string;
  shipmentName?: string;
};