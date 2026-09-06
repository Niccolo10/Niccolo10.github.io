import { getCollection } from 'astro:content';
export async function GET() {
  const articles = await getCollection('research', ({data}) => !data.draft);
  const paths = ['/', '/about/', '/research/', '/archive/', '/bug-code/', ...articles.map(e => `/research/${e.id}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p => `<url><loc>https://niccoloparlanti.com${p}</loc></url>`).join('')}</urlset>`, {headers:{'Content-Type':'application/xml'}});
}
