import {readFile} from 'node:fs/promises';
import './chemins-en-cours-data.js';

export async function characterDirectory() {
  const load = async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
  const [atlas, portraits] = await Promise.all([load('atlas-repertoire.json'), load('atlas-continuites.json')]);
  const byId = Object.fromEntries(atlas.people.map(p => [p.id, {
    name: p.name, role: p.role, story: portraits[p.id], places: p.places,
    chapters: Object.keys(atlas.chapters).filter(n => atlas.chapters[n].includes(p.id)),
    relations: p.links.map(link => link.text)
  }]));
  const adaptation = globalThis.TreizeUpcomingData;
  const salon = adaptation.scenes.find(s => s.id === 'traitre');
  for (const key of salon.people.filter(key => key !== 'ahmed')) {
    const p = adaptation.profiles[key];
    byId['salon-' + key] = {name:p.name, role:p.role, story:p.paragraphs,
      places:[{place:salon.place}], chapters:[salon.chapter], relations:[]};
  }
  return byId;
}
