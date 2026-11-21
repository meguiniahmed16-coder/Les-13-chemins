const option = (id, label, companion = false) => Object.freeze({id, label, companion});
export const avatarCatalog = Object.freeze([
  {key: 'top', label: 'Haut', options: [option('polo','Polo'),option('coton','T-shirt en coton'),option('col-rond','T-shirt rentré',true)]},
  {key: 'bottom', label: 'Pantalon', options: [option('jean','Jean évasé'),option('jean-nuit','Jean de nuit'),option('laine','Pantalon en laine',true)]},
  {key: 'accessory', label: 'Accessoire', options: [option('aucun','Sans accessoire'),option('lunettes','Lunettes de lecture'),option('ecaille','Monture écaille',true)]},
  {key: 'hair', label: 'Coiffure', options: [option('court','Coupe courte'),option('texture','Courte texturée'),option('afro','Afro court'),option('carre','Carré dégagé',true)]},
  {key: 'face', label: 'Visage', options: [option('naturel','Joues naturelles'),option('doux','Joues pleines'),option('sculpte','Pommettes marquées',true)]},
  {key: 'skin', label: 'Teint', options: [option('clair','Clair'),option('dore','Doré'),option('brun','Brun'),option('profond','Brun profond')]}
]);
export function normaliseAvatar(input, companion = false) {
  return Object.fromEntries(avatarCatalog.map(({key, options}) => {
    const match = options.find(item => item.id === input?.[key] && (companion || !item.companion));
    return [key, match?.id ?? options[0].id];
  }));
}
export function randomAvatar(random=Math.random) {
  return Object.fromEntries(avatarCatalog.map(({key, options}) => {
    const free = options.filter(item => !item.companion);
    return [key, free[Math.floor(random() * free.length)].id];
  }));
}
