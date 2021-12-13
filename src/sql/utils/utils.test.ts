import { ScopedVars } from '@grafana/data';
import { applyTemplateVariables, filterQuery, getSuggestions } from './utils';
import { mockQuery } from '../QueryEditor/__mocks__/query';
import { CodeEditorSuggestionItem } from '@grafana/ui';

describe('filterQuery', () => {
  it("should filter the query if it's empty", () => {
    expect(filterQuery({ ...mockQuery, rawSQL: 'query' })).toBe(true);
    expect(filterQuery({ ...mockQuery, rawSQL: '' })).toBe(false);
  });
});

const scopedVars: Record<string, any> = {
  $simple: 'foo',
  $multiple: ['foo', 'bar'],
};
// simplified version of getTemplateSrv().replace
const replace = jest.fn((target?: string, scopedVars?: ScopedVars, format?: string | Function) => {
  let res = target ?? '';
  if (scopedVars && typeof format === 'function') {
    Object.keys(scopedVars).forEach((v) => (res = res.replace(v, format(scopedVars[v]))));
  }
  return res;
});
const getVariables = jest.fn().mockReturnValue([{ name: 'simple' }, { name: 'multiple' }]);
const getTemplateSrv = jest.fn().mockImplementation(() => ({ getVariables, replace }));

describe('applyTemplateVariables', () => {
  it('should replace a simple var', () => {
    const res = applyTemplateVariables({ ...mockQuery, rawSQL: 'select * from $simple' }, scopedVars, getTemplateSrv);
    expect(res.rawSQL).toEqual('select * from foo');
  });

  it('should replace a multiple var', () => {
    const res = applyTemplateVariables(
      { ...mockQuery, rawSQL: 'select * from foo where var in ($multiple)' },
      scopedVars,
      getTemplateSrv
    );
    expect(res.rawSQL).toEqual(`select * from foo where var in ('foo','bar')`);
  });
});

describe('applyTemplateVariables', () => {
  it('should append template variables to suggestions', () => {
    const sugs: CodeEditorSuggestionItem[] = [{ label: 'foo' }];
    const res = getSuggestions(getTemplateSrv, sugs);
    expect(res).toEqual([
      { label: 'foo' },
      { label: '$simple', kind: 'text', detail: '(Template Variable) ' },
      { label: '$multiple', kind: 'text', detail: '(Template Variable) ' },
    ]);
  });
});
