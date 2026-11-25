// Access is supplied only by the existing, server-verified member/author session.
// Uploaded photographs and camera frames never pass through this handler.
export function incarnationsAccess(member, author) {
  if (!member?.id) throw new Error('Une session est nécessaire pour ouvrir l’atelier.');
  return {role: author ? 'owner' : 'member', memberId: String(member.id)};
}

export function incarnationsDocument(template, access) {
  if (!['owner', 'member'].includes(access?.role) || !access.memberId) throw new Error('Accès à l’atelier invalide.');
  if (!template.includes('__SALON_ACCESS__')) throw new Error('La version de l’atelier est incomplète.');
  const ownerBlock = /<!--OWNER_UPLOAD_START-->[\s\S]*?<!--OWNER_UPLOAD_END-->/g;
  let html = access.role === 'member' ? template.replace(ownerBlock, '') : template.replace(/<!--OWNER_UPLOAD_(?:START|END)-->/g, '');
  if (access.role === 'member') html = html
    .replace('Choisir une photo sur mon téléphone','Ouvrir ma caméra selfie')
    .replace('Crée ton personnage 3D','Crée ton personnage avec ton selfie')
    .replace('Choisis une photo de ton téléphone. L’atelier fabrique le personnage, puis tu télécharges ses fichiers.','Prends ton selfie avec la caméra. L’atelier crée ton personnage, puis tu télécharges ses fichiers.')
    .replace('JPEG, PNG ou WebP · Un seul visage bien visible. La création démarre après ton choix.','Caméra avant · Un seul visage de face, bouche fermée, avec un bon éclairage.')
    .replaceAll('Choisis ta photo','Prends ton selfie')
    .replace('Les outils 3D se chargent. Tu peux déjà sélectionner ton image.','Ton accès est vérifié avant l’ouverture de la caméra.');
  const json = JSON.stringify(access).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  html = html.replaceAll('__SALON_ACCESS__', () => json);
  if (access.role === 'member' && /<input\b[^>]*\btype\s*=\s*["']?file\b/i.test(html)) throw new Error('Le mode selfie ne doit pas proposer d’import de fichier.');
  return html;
}

export const incarnationsHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'private, no-store, max-age=0',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'vary': 'Cookie',
  'x-frame-options': 'SAMEORIGIN',
  'x-robots-tag': 'noindex, nofollow',
  'permissions-policy': 'camera=(self), microphone=()',
  'content-security-policy': "frame-ancestors 'self'; object-src 'none'; base-uri 'self'"
};
