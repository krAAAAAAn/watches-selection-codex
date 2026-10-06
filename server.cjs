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
  const images=w.images.map(im=>{const src=string(im.src,10000000);if(!imageURL(src))throw Error('Une photo doit utiliser HTTPS ou une image intégrée.');const fallbacks=im.fallbacks??[];if(!Array.isArray(fallbacks)||fallbacks.length>20||fallbacks.some(f=>!https(f)))throw Error('Source de photo invalide.');const sourceUrl=im.sourceUrl??'';if(sourceUrl&&!https(sourceUrl))throw Error('Source originale invalide.');return{src,alt:string(im.alt??'',1000),fallbacks:[...fallbacks],...(sourceUrl?{sourceUrl}:{}),transparent:im.transparent===true}});
  const links=w.links.map(l=>{const url=string(l.url,4000);if(!https(url))throw Error('Un lien doit utiliser HTTPS.');return{label:string(l.label,1000),url}});
  const blocks=w.blocks.map(b=>({title:string(b.title,1000),text:string(b.text)}));
  const status=w.status??'wanted';if(!['wanted','owned','rejected'].includes(status)||('archived'in w&&typeof w.archived!=='boolean'))throw Error('Statut invalide.');
  const variants=w.variants??[];if(!Array.isArray(variants)||variants.length>100)throw Error('Variantes invalides.');const normalizedVariants=variants.map(v=>{const name=string(v.name,250).trim();if(!name)throw Error('Une variante doit avoir un nom.');const photoIndex=v.photoIndex??null;if(photoIndex!==null&&(!Number.isInteger(photoIndex)||photoIndex<0||photoIndex>=images.length))throw Error('Photo de variante invalide.');const url=string(v.url??'',4000);if(url&&!https(url))throw Error('Lien de variante invalide.');return{name,reference:string(v.reference??'',250),color:string(v.color??'',100),photoIndex,url}});
  return{id,name,status,archived:w.archived===true,variants:normalizedVariants,roles:[...w.roles],summary:string(w.summary??''),subtitle:string(w.subtitle??''),notes:string(w.notes??''),specs,images,links,blocks};
 });
 const chosen=raw.chosen.map((id,i)=>{if(id===null)return null;const w=watches.find(w=>w.id===id);if(!w||!w.roles.includes(i)||w.archived||w.status==='rejected')throw Error('Un choix principal ne correspond pas à sa catégorie.');return id});
 return{version:1,watches,chosen};
}



const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
const dns=require('node:dns').promises;
const net=require('node:net');
const tlsHttp=require('node:https');
function publicAddress(ip){if(net.isIP(ip)===4){const a=ip.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&(a[1]===168||a[1]===0))||(a[0]===100&&a[1]>=64&&a[1]<=127)||(a[0]===198&&(a[1]===18||a[1]===19)))}return net.isIP(ip)===6&&/^2[0-9a-f]{3}:/i.test(ip)}
function imageType(bytes){if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return'png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return'jpeg';if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return'webp';if(['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6)))return'gif';throw Error('Le fichier reçu n’est pas une photo PNG, JPEG, WebP ou GIF.');}
async function downloadPhoto(source,redirects=0){
 const u=new URL(source);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||redirects>4)throw Error('Source photo HTTPS invalide.');
 const addresses=await dns.lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw Error('La source doit être un site public, pas une adresse du réseau local.');const pinned=addresses[0];
 return new Promise((resolve,reject)=>{let settled=false;const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value)};
 const req=tlsHttp.get(u,{headers:{'User-Agent':'WatchCollection/0.3','Accept':'image/png,image/jpeg,image/webp,image/gif'},lookup:(_host,opts,cb)=>opts.all?cb(null,[pinned]):cb(null,pinned.address,pinned.family)},res=>{
  if([301,302,303,307,308].includes(res.statusCode)){res.resume();let target;try{target=new URL(res.headers.location,u).href}catch{finish(Error('Redirection invalide.'));return}downloadPhoto(target,redirects+1).then(v=>finish(null,v),finish);return}
  if(res.statusCode!==200){res.resume();finish(Error('Le site source a répondu '+res.statusCode+'.'));return}
  let size=0,chunks=[];res.on('data',chunk=>{size+=chunk.length;if(size>2097152){finish(Error('Photo trop volumineuse (maximum 2 Mo).'));req.destroy();return}chunks.push(chunk)});res.on('error',finish);res.on('end',()=>{try{const bytes=Buffer.concat(chunks),type=imageType(bytes);finish(null,{src:'data:image/'+type+';base64,'+bytes.toString('base64'),sourceUrl:u.href})}catch(e){finish(e)}});
 });const timer=setTimeout(()=>{finish(Error('Le site source ne répond pas (15 secondes).'));req.destroy()},15000);req.on('error',finish);
 });
}

function createServer({password='',dataDir=path.join(__dirname,'.collection-data'),htmlPath=path.join(__dirname,'index.html'),secureCookies=false,photoDownloader=downloadPhoto}={}){
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
   if(req.method==='POST'&&url.pathname==='/api/photo'){const input=await body(req);if(typeof input.url!=='string'||input.url.length>4000)throw fail(400,'URL photo invalide.');try{json(res,200,await photoDownloader(input.url))}catch(e){throw fail(422,e.message)}return}
   if(req.method==='POST'&&url.pathname==='/api/logout'){sessions.delete(tokenOf(req));json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});return}
   if(req.method==='GET'&&url.pathname==='/api/collection'){const record=await read();json(res,200,url.searchParams.get('revision')===String(record.revision)?{revision:record.revision,unchanged:true}:record);return}
   if(req.method==='PUT'&&url.pathname==='/api/collection'){
    const input=await body(req);if(Array.isArray(input.collection?.watches)&&input.collection.watches.some(w=>!w||w.status===undefined||typeof w.archived!=='boolean'||!Array.isArray(w.variants)))throw fail(426,'Cette page utilise une ancienne version du carnet. Rechargez-la avant de sauvegarder pour préserver les statuts et variantes.');if(!Number.isSafeInteger(input.revision)||input.revision<0)throw fail(400,'Version invalide.');let collection;try{collection=validate(input.collection)}catch(e){throw fail(400,e.message)}
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
module.exports={createServer,publicAddress,imageType,downloadPhoto,validate};

if(require.main===module){
const port=Number(process.env.PORT||8765),host=process.env.HOST||'127.0.0.1';
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT doit être compris entre 1 et 65535.');
const server=createServer({password:process.env.COLLECTION_PASSWORD||'',dataDir:process.env.COLLECTION_DATA_DIR,secureCookies:process.env.COLLECTION_SECURE_COOKIES==='1'});
server.listen(port,host,()=>{console.log(`Carnet sur le port ${port}. Synchronisation ${process.env.COLLECTION_PASSWORD?'activée':'désactivée (COLLECTION_PASSWORD absent)'}.`);if(process.env.COLLECTION_PASSWORD)console.log('Dossier de données : '+path.resolve(process.env.COLLECTION_DATA_DIR||path.join(__dirname,'.collection-data'))+' (créé après la première connexion et sauvegarde).');});
server.on('error',e=>{console.error(e.message);process.exitCode=1});

}
