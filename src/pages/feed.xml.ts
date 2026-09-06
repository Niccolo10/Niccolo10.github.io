import { getCollection } from 'astro:content';
const escape = (s: string) => s.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET() {
  const entries = [...await getCollection('research', ({data}) => !data.draft), ...await getCollection('bugCode', ({data}) => !data.draft)].sort((a,b) => b.data.date.valueOf() - a.data.date.valueOf());
return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Niccolò Parlanti | Research</title><link>https://niccoloparlanti.com/research/</link><description>Offensive security research and field notes.</description>${entries.map(e => `<item><title>${escape(e.data.title)}</title><description>${escape(e.data.description)}</description><link>https://niccoloparlanti.com/${e.collection === 'bugCode' ? 'bug-code' : 'research'}/${e.id}/</link><guid>https://niccoloparlanti.com/${e.collection === 'bugCode' ? 'bug-code' : 'research'}/${e.id}/</guid><pubDate>${e.data.date.toUTCString()}</pubDate></item>`).join('')}</channel></rss>`, {headers:{'Content-Type':'application/rss+xml'}});
}
