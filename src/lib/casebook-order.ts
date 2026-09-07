type CaseEntry = { data: { order?: number; rule: string } };

export const casebookChapters = [
  { id: 'injection', title: 'Injection and server-side behavior', description: 'When input changes what the server parses, requests, or executes.' },
  { id: 'access', title: 'Identity and access', description: 'Who the caller is, and what that identity is allowed to do.' },
  { id: 'logic', title: 'Business logic and data exposure', description: 'Trusted calculations, searchable secrets, and unsafe storage.' },
  { id: 'further', title: 'Further cases', description: 'More findings from the casebook.' },
];

const topics: Record<string, { chapter: string; label: string }> = {
  '05': { chapter: 'injection', label: 'Server-side template injection' },
  '07': { chapter: 'injection', label: 'Path-only SSRF and error disclosure' },
  '04': { chapter: 'injection', label: 'SAML XML external entity injection' },
  '03': { chapter: 'access', label: 'Account identity confusion' },
  '02': { chapter: 'access', label: 'Missing cloud API authorization' },
  '01': { chapter: 'access', label: 'Invitation hijacking' },
  '08': { chapter: 'logic', label: 'Future-price manipulation' },
  '09': { chapter: 'logic', label: 'Wildcard identifier disclosure' },
  '06': { chapter: 'logic', label: 'Password storage in cookies' },
};

export function casebookTopic(entry: CaseEntry) {
  return topics[entry.data.rule] ?? { chapter: 'further', label: 'Technical case study' };
}

// Article numbers are stable references; editorial reading order is independent.
export function casebookOrder(a: CaseEntry, b: CaseEntry) {
  return casebookChapters.findIndex(c => c.id === casebookTopic(a).chapter)
    - casebookChapters.findIndex(c => c.id === casebookTopic(b).chapter)
    || (a.data.order ?? 50) - (b.data.order ?? 50)
    || a.data.rule.localeCompare(b.data.rule);
}
