import { DataQuery } from '@grafana/schema';
import { FillValueOptions } from './QueryEditor/FillValueSelect';

export const defaultKey = '__default';

export interface SQLQuery extends DataQuery {
  rawSQL: string;
  format?: number;
  fillMode?: { mode: FillValueOptions; value?: number };
}
