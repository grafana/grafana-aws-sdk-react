import { ScopedVars, TypedVariableModel } from '@grafana/data';
import { SQLQuery } from '../types';
import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';

/**
 * Do not execute queries that do not exist yet
 */
export function filterSQLQuery(query: SQLQuery): boolean {
  return !!query.rawSQL;
}

export function applySQLTemplateVariables<T extends SQLQuery>(
  query: T,
  scopedVars: ScopedVars,
  getTemplateSrv: () => any
): T {
  const templateSrv = getTemplateSrv();
  return {
    ...query,
    rawSQL: templateSrv.replace(query.rawSQL, scopedVars, interpolateVariable),
  };
}

function interpolateVariable(value: string | string[]) {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  const quotedValues = value.map((v) => {
    return quoteLiteral(v);
  });
  return quotedValues.join(',');
}

function quoteLiteral(value: any) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

export const appendTemplateVariablesAsSuggestions = (getTemplateSrv: () => any, sugs: CodeEditorSuggestionItem[]) => {
  const templateSrv = getTemplateSrv();
  const templateSugs: CodeEditorSuggestionItem[] = [];
  templateSrv.getVariables().forEach((variable: TypedVariableModel) => {
    const label = '$' + variable.name;
    let val = templateSrv.replace(label);
    if (val === label) {
      val = '';
    }
    templateSugs.push({
      label,
      kind: CodeEditorSuggestionItemKind.Text,
      detail: `(Template Variable) ${val}`,
    });
  });

  return sugs.concat(templateSugs);
};
