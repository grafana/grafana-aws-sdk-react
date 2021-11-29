import { DataQuery } from '@grafana/data';
import { FillValueOptions } from '../FillValueSelect';

export enum SQLOptions {
  Table,
  TimeSeries,
}

export interface SQLQuery extends DataQuery {
  rawSQL: string;
  format?: SQLOptions;
  fillMode?: { mode: FillValueOptions; value?: number };
}

export const mockQuery: SQLQuery = { rawSQL: 'select * from table', refId: '', fillMode: { mode: 0 }, format: 0 };
