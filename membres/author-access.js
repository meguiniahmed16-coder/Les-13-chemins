function authorEndpoint(kind,logout=false){
  if(kind==='atelier')return '/api/atelier/auth/'+(logout?'logout':'session');
  if(kind==='edition')return '/.netlify/functions/editor?action='+(logout?'logout':'owner-session');
  throw Error('Espace auteur inconnu.');
}
export async function hasAuthorSession(kind){
  const response=await fetch(authorEndpoint(kind),{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(response.status===401)return false;
  if(!response.ok)throw Error('La session auteur n’a pas pu être vérifiée.');
  return (await response.json()).ok===true;
}
export async function logoutAuthor(kind){
  const response=await fetch(authorEndpoint(kind,true),{method:'POST',headers:{'content-type':'application/json'},body:'{}',credentials:'same-origin',redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(20000)});
  if((!response.ok&&response.type!=='opaqueredirect')||await hasAuthorSession(kind))throw Error('La déconnexion n’a pas pu être confirmée. Réessaie.');
}
