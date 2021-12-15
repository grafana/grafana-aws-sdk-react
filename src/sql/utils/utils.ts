import { ScopedVars, VariableModel } from '@grafana/data';
import { SQLQuery } from '../types';
import { CodeEditorSuggestionItem, CodeEditorSuggestionItemKind } from '@grafana/ui';

/**
 * Do not execute queries that do not exist yet
 */
export function filterSQLQuery(query: SQLQuery): boolean {
  return !!query.rawSQL;
}

export function applySQLTemplateVariables(
  query: SQLQuery,
  scopedVars: ScopedVars,
  getTemplateSrv: () => any
): SQLQuery {
  const templateSrv = getTemplateSrv();
  return {
    ...query,
    rawSQL: templateSrv.replace(query.rawSQL, scopedVars, interpolateVariable),
  };
}

function interpolateVariable(value: string | string[]) {
  if (typeof value === 'string') {
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
  templateSrv.getVariables().forEach((variable: VariableModel) => {
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
