import {fail,uuid} from './model.mjs';
export async function receiveWithdrawal(db, input) {
  const {id}=input;
  if (!uuid.test(id)) fail(400,'Identifiant de demande invalide.');
  const fields={};
  for (const [key,max] of [['name',160],['email',254],['contract',750]]) {
    const value=input[key];
    if (typeof value!=='string'||!value.trim()||value.trim().length>max) fail(400,'Vérifiez les informations de votre demande.');
    fields[key]=value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)||input.confirm!==true||input.website) fail(400,'La déclaration doit être confirmée avec une adresse électronique valide.');
  const {name,email,contract}=fields;
  const received=new Date().toISOString();
  await db.prepare('INSERT OR IGNORE INTO legal_withdrawals(id,name,email,contract,received) VALUES(?,?,?,?,?)').bind(id,name,email,contract,received).run();
  const saved=await db.prepare('SELECT name,email,contract,received FROM legal_withdrawals WHERE id=?').bind(id).first();
  if (!saved||saved.name!==name||saved.email!==email||saved.contract!==contract) fail(409,'Cette référence correspond déjà à une autre déclaration.');
  return {id,received:saved.received};
}
