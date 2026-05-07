export type RequestPayload = {
  current: number;
  size: number;

  shipmentState: 2 | 3;

  tmsType: number;
  sendNetworkCode: string;
  timeType: number;

  startTime: string;
  endTime: string;

  countryId: string;
};