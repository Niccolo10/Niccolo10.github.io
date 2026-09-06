import aliases from '../../legacy-redirects.json';
import { GET as feed } from './feed.xml';
export function getStaticPaths() {
  return Object.keys(aliases).filter(path => path.endsWith('.xml')).map(path => ({params:{legacy:path.slice(1,-4)}}));
}
export const GET = feed;
