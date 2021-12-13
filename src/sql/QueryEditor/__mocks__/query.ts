import { SQLQuery } from '../../types';

export enum SQLOptions {
  Table,
  TimeSeries,
}

export const mockQuery: SQLQuery = { rawSQL: 'select * from table', refId: '', fillMode: { mode: 0 }, format: 0 };
