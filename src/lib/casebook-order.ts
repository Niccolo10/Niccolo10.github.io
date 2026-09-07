type CaseEntry = { data: { order?: number; rule: string } };

// Article numbers are stable references; editorial reading order is independent.
export function casebookOrder(a: CaseEntry, b: CaseEntry) {
  return (a.data.order ?? 50) - (b.data.order ?? 50)
    || a.data.rule.localeCompare(b.data.rule);
}
