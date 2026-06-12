// ================== TYPES ==================

export interface ApiResponse {
  code: number;
  msg: string;
  data: Data;
  details: unknown;
  fail: boolean;
  succ: boolean;
}

export interface Data {
  records: RecordItem[];
  total: number;
  size: number;
  current: number;
  searchCount: boolean;
  pages: number;
}

export interface RecordItem {
  tmsType: number;
  actualArrivalTime: string | null;
  carrierCheckoutAgentCode: string;
  carrierCheckoutAgentName: string;
  vehicleBelongCode: number;
  vehicleBelongName: string;
  total: number;
  actualBatchTime: string | null;
  actualDepartureTime: string | null;
  actualStopTime: string | null;
  actualUseTime: number | null;
  agingType: string | null;
  arriveNetworkCode: string;
  arriveNetworkName: string;
  arriveProvince: string | null;
  businessAttribute: number;
  carrierName: string;
  carrierType: number;
  delayStopTime: string | null;
  delayTime: string | null;
  driverContact: string | null;
  driverName: string;
  estimateBatchTime: string | null;
  inBoundWeighTime: string | null;
  loadCapacity: number | null;
  loadingScanEndTime: string;
  loadingScanStartTime: string;
  loadingScanTotalTime: number;
  loadWeight: number;
  outBoundGrossWeight: number | null;
  outBoundSuttleWeight: number | null;
  outBoundTareWeight: number | null;
  outBoundWeighTime: string | null;
  plannedArrivalTime: string;
  plannedDepartureTime: string;
  plateNumber: string;
  plateColor: number;
  predictArriveTime: string | null;
  quotationModel: number;
  scanTime: string | null;
  sendNetworkCode: string;
  sendNetworkName: string;
  shipmentName: string;
  shipmentNo: string;
  shipmentState: number;
  shipmentType: number;
  stopTime: string | null;
  tardyTime: string | null;
  trackInTime: string | null;
  trackOutTime: string | null;
  trailerNumber: string | null;
  unLoadLineTime: string | null;
  unLoadingScanEndTime: string | null;
  unLoadingScanStartTime: string | null;
  unLoadingScanTotalTime: number | null;
  unScanTime: string | null;
  useTime: number;
  useWayTime: number | null;
  vehicleDoorCnt: number | null;
  vehiclelineCode: string;
  vehiclelineName: string;
  vehicletypeName: string;
  stationWaitingTime: number | null;
  cubeNumber: number | null;
  promotion: number;
  shifts: number;
  operationModel: number;
  mileage: number;
  carrierShortName: string;
  applyReasonItem: string | null;
  applyReason: string | null;
  auditStatus: number;
  auditRemark: string | null;
  auditer: string | null;
  vehicleTypegroup: string;
  axleNumber: number;
  vehicleOrigin: string;
  overtimeType: string | null;
  overtimeReasons: string | null;
  oriRegShiftCarrierId: string | null;
  oriRegShiftCarrierName: string | null;
  isAssistLine: number;
  billingWay: number;
  freightCode: string | null;
  isStop: number;
  appTrackDepartureTime: string | null;
  appTrackArrivalTime: string | null;
  carrierId: string;
  carrierCode: string | null;
  bandLineId: number;
  bandLineName: string;
  loadingStatus: number;
  startHandlingType: string;
  endHandlingType: string;
  scanPackageNum: number;
  scanWaybillNum: number;
  driverActualUseTime: number | null;
  driverUseWayTime: number | null;
  isGuaranteeLine: number;
  hasReturnCar: number;
  actualHasReturnCar: number;
  unScanPackageNum: number | null;
  unScanWaybillNum: number | null;
  winCarrierStatus: string | null;
  winCarrierRanking: number | null;
  winCarrierId: string | null;
  winCarrierName: string | null;
  isOneHourInterval: number;
  linePartVolumeRate: number | null;
}

export type VehicleCheckPayload = {
  shipmentNo: string;
  plateNumber: string;
  vehicleType: string;
};

export type VehicleCheckResult = {
  shipmentNo: string;
  plateNumber: string;
  vehicleType: string;
  status?: string;
  found: boolean;
};