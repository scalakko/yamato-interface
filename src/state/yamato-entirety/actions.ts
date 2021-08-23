import { createAction } from '@reduxjs/toolkit';
import { LogEvent } from './reducer';

export const fetchYamatoState = createAction<{
  totalCollateral: number;
  totalDebt: number;
  tvl: number;
  tcr: number;
  redemptionReserve: number;
  sweepReserve: number;
  sweepableCandiate: number;
}>('yamato-entirety/fetchYamatoState');

export const fetchRateOfEthJpy = createAction<{
  rateOfEthJpy: number;
}>('yamato-entirety/fetchRateOfEthJpy');

export const fetchEvents = createAction<{
  events: LogEvent[];
}>('yamato-entirety/fetchEvents');