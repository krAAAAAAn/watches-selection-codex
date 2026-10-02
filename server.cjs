// Standalone Node.js server: standard library only.
// Shared data validation. Keep in step with the standalone HTML validator.
function https(value){try{return typeof value==='string'&&new URL(value).protocol==='https:'&&!new URL(value).username&&!new URL(value).password}catch{return false}}
function imageURL(value){return https(value)||(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=\s]+$/.test(value))}
function validate(raw){
 if(!raw||raw.version!==1||!Array.isArray(raw.watches)||raw.watches.length>1000||!Array.isArray(raw.chosen)||raw.chosen.length!==8)throw Error('Format de collection non reconnu (version 1 attendue).');
 const string=(value,max=20000)=>{if(typeof value!=='string'||value.length>max)throw Error('Un champ texte est absent ou trop long.');return value};
 const ids=new Set();
 const watches=raw.watches.map(w=>{
  if(!w||typeof w!=='object')throw Error('Fiche invalide.');
  const id=string(w.id,120);if(!/^[a-zA-Z0-9_-]+$/.test(id)||ids.has(id))throw Error('Identifiant de montre invalide ou dupliqué.');ids.add(id);
  const name=string(w.name,250).trim();if(!name)throw Error('Une montre doit avoir un nom.');
  if(!Array.isArray(w.roles)||w.roles.length>8||w.roles.some(r=>!Number.isInteger(r)||r<0||r>7)||new Set(w.roles).size!==w.roles.length)throw Error('Catégories invalides.');
  if(!w.specs||Array.isArray(w.specs)||typeof w.specs!=='object'||Object.keys(w.specs).length>100)throw Error('Caractéristiques invalides.');
  const specs=Object.fromEntries(Object.entries(w.specs).map(([k,v])=>[string(k,200),string(v)]));
  if(!Array.isArray(w.images)||w.images.length>100||!Array.isArray(w.links)||w.links.length>100||!Array.isArray(w.blocks)||w.blocks.length>100)throw Error('Photos, liens ou descriptions invalides.');
  const images=w.images.map(im=>{const src=string(im.src,10000000);if(!imageURL(src))throw Error('Une photo doit utiliser HTTPS ou une image intégrée.');const fallbacks=im.fallbacks??[];if(!Array.isArray(fallbacks)||fallbacks.length>20||fallbacks.some(f=>!https(f)))throw Error('Source de photo invalide.');return{src,alt:string(im.alt??'',1000),fallbacks:[...fallbacks]}});
  const links=w.links.map(l=>{const url=string(l.url,4000);if(!https(url))throw Error('Un lien doit utiliser HTTPS.');return{label:string(l.label,1000),url}});
  const blocks=w.blocks.map(b=>({title:string(b.title,1000),text:string(b.text)}));
  return{id,name,roles:[...w.roles],summary:string(w.summary??''),subtitle:string(w.subtitle??''),notes:string(w.notes??''),specs,images,links,blocks};
 });
 const chosen=raw.chosen.map((id,i)=>{if(id===null)return null;const w=watches.find(w=>w.id===id);if(!w||!w.roles.includes(i))throw Error('Un choix principal ne correspond pas à sa catégorie.');return id});
 return{version:1,watches,chosen};
}



const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
function createServer({password='',dataDir=path.join(__dirname,'.collection-data'),htmlPath=path.join(__dirname,'index.html'),secureCookies=false}={}){
 const sessions=new Map(),attempts=new Map(),file=path.join(dataDir,'collection.json');
 const salt=crypto.randomBytes(16),passwordHash=password?crypto.scryptSync(password,salt,32):null;
 let writing=Promise.resolve();
 const fail=(status,message)=>Object.assign(new Error(message),{status});
 const json=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data))};
 async function body(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>30000000)throw fail(413,'Données trop volumineuses.');chunks.push(chunk)}try{return JSON.parse(Buffer.concat(chunks).toString())}catch{throw fail(400,'JSON invalide.')}}
 async function read(){try{const record=JSON.parse(await fs.readFile(file,'utf8'));if(!Number.isSafeInteger(record.revision)||record.revision<1)throw Error('Version invalide.');record.collection=validate(record.collection);return record}catch(e){if(e.code==='ENOENT')return{revision:0,collection:null};throw fail(500,'Sauvegarde serveur illisible : elle n’a pas été écrasée.')}}
 function tokenOf(req){return(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('collection_session='))?.slice('collection_session='.length)}
 function authenticated(req){const token=tokenOf(req),expiry=sessions.get(token);if(!expiry||expiry<Date.now()){sessions.delete(token);return false}return true}
 function cookie(token,maxAge=604800){return`collection_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secureCookies?'; Secure':''}`}
 const cleanup=setInterval(()=>{const now=Date.now();for(const[k,v]of sessions)if(v<now)sessions.delete(k);for(const[k,v]of attempts)if(now-v.since>60000)attempts.delete(k)},60000);cleanup.unref();
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return}
   if(url.pathname==='/'||url.pathname==='/index.html'){if(!['GET','HEAD'].includes(req.method))throw fail(405,'Méthode refusée.');const html=await fs.readFile(htmlPath);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:html);return}
   if(!url.pathname.startsWith('/api/'))throw fail(404,'Page introuvable.');
   if(req.method==='GET'&&url.pathname==='/api/status'){json(res,200,{enabled:!!password,authenticated:!!password&&authenticated(req)});return}
   if(!password)throw fail(503,'Synchronisation non activée sur ce serveur.');
   if(!['GET','HEAD'].includes(req.method)){
    if(req.headers['sec-fetch-site']==='cross-site')throw fail(403,'Origine refusée.');
    if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)throw fail(403,'Origine refusée.');
    if(!req.headers['content-type']?.startsWith('application/json'))throw fail(415,'JSON requis.');
   }
   if(req.method==='POST'&&url.pathname==='/api/login'){
    const key=req.socket.remoteAddress,now=Date.now();let counter=attempts.get(key);if(!counter||now-counter.since>60000)counter={since:now,count:0};if(counter.count>=10)throw fail(429,'Trop de tentatives. Réessayez dans une minute.');counter.count++;attempts.set(key,counter);
    const input=await body(req);if(typeof input.password!=='string'||input.password.length>1000||!crypto.timingSafeEqual(await scrypt(input.password,salt,32),passwordHash))throw fail(401,'Mot de passe incorrect.');
    if(sessions.size>=1000)sessions.delete(sessions.keys().next().value);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,now+604800000);attempts.delete(key);json(res,200,{ok:true},{'Set-Cookie':cookie(token)});return;
   }
   if(!authenticated(req))throw fail(401,'Connectez ce navigateur à votre collection.');
   if(req.method==='POST'&&url.pathname==='/api/logout'){sessions.delete(tokenOf(req));json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});return}
   if(req.method==='GET'&&url.pathname==='/api/collection'){const record=await read();json(res,200,url.searchParams.get('revision')===String(record.revision)?{revision:record.revision,unchanged:true}:record);return}
   if(req.method==='PUT'&&url.pathname==='/api/collection'){
    const input=await body(req);if(!Number.isSafeInteger(input.revision)||input.revision<0)throw fail(400,'Version invalide.');let collection;try{collection=validate(input.collection)}catch(e){throw fail(400,e.message)}
    const operation=writing.then(async()=>{
     const current=await read();if(current.revision!==input.revision){json(res,409,{error:'La collection a changé dans un autre navigateur.',revision:current.revision});return}
     const next={revision:current.revision+1,collection};await fs.mkdir(dataDir,{recursive:true,mode:0o700});const temporary=path.join(dataDir,'collection-'+crypto.randomBytes(8).toString('hex')+'.tmp');
     let handle;try{handle=await fs.open(temporary,'wx',0o600);await handle.writeFile(JSON.stringify(next));await handle.sync();await handle.close();handle=null;await fs.rename(temporary,file)}catch(e){if(handle)await handle.close().catch(()=>{});await fs.unlink(temporary).catch(()=>{});throw e}
     json(res,200,{revision:next.revision});
    });writing=operation.catch(()=>{});await operation;return;
   }
   throw fail(404,'Route introuvable.');
  }catch(e){if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Le serveur ne peut pas enregistrer la collection. Aucune sauvegarde réussie n’est annoncée.'});else res.end()}
 });
 server.on('close',()=>{clearInterval(cleanup);sessions.clear()});return server;
}
module.exports={createServer};

if(require.main===module){
const port=Number(process.env.PORT||8765),host=process.env.HOST||'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT doit être compris entre 1 et 65535.');
const server=createServer({password:process.env.COLLECTION_PASSWORD||'',dataDir:process.env.COLLECTION_DATA_DIR,secureCookies:process.env.COLLECTION_SECURE_COOKIES==='1'});
server.listen(port,host,()=>console.log(`Carnet sur le port ${port}. Synchronisation ${process.env.COLLECTION_PASSWORD?'activée':'désactivée (COLLECTION_PASSWORD absent)'}.`));
server.on('error',e=>{console.error(e.message);process.exitCode=1});

}
