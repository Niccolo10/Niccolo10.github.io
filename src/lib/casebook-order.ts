type CaseEntry = { id: string; data: { order?: number; rule: string } };

export const casebookChapters = [
  { id: 'injection', title: 'Injection and server-side behavior', description: 'When input changes what the server parses, requests, or executes.' },
  { id: 'access', title: 'Identity and access', description: 'Who the caller is, and what that identity is allowed to do.' },
  { id: 'logic', title: 'Business logic and data exposure', description: 'Trusted calculations, searchable secrets, and unsafe storage.' },
  { id: 'further', title: 'Further cases', description: 'More findings from the casebook.' },
];

const topics: Record<string, { chapter: string; label: string }> = {
  'a-template-is-not-an-administrator': { chapter: 'injection', label: 'Server-side template injection' },
  'an-id-shall-not-rewrite-the-route': { chapter: 'injection', label: 'Path-only SSRF and error disclosure' },
  'a-signed-response-is-not-a-safe-response': { chapter: 'injection', label: 'SAML XML external entity injection' },
  'a-token-is-not-an-account': { chapter: 'access', label: 'Account identity confusion' },
  'service-identity-is-not-permission': { chapter: 'access', label: 'Missing cloud API authorization' },
  'invitation-is-not-identity': { chapter: 'access', label: 'Invitation hijacking' },
  'the-shopper-shall-not-set-the-clock': { chapter: 'logic', label: 'Future-price manipulation' },
  'a-mask-shall-not-answer-questions': { chapter: 'logic', label: 'Wildcard identifier disclosure' },
  'remember-the-device-not-the-password': { chapter: 'logic', label: 'Password storage in cookies' },
};

export function casebookTopic(entry: CaseEntry) {
  return topics[entry.id] ?? { chapter: 'further', label: 'Technical case study' };
}

// Chapter membership uses stable slugs, independent of displayed numbering.
export function casebookOrder(a: CaseEntry, b: CaseEntry) {
  return casebookChapters.findIndex(c => c.id === casebookTopic(a).chapter)
    - casebookChapters.findIndex(c => c.id === casebookTopic(b).chapter)
    || (a.data.order ?? 50) - (b.data.order ?? 50)
    || a.data.rule.localeCompare(b.data.rule);
}
