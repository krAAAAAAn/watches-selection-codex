// Experiment only: no application route, database write, dependency or AI call.
const fs = require('node:fs/promises');
const path = require('node:path');
const https = require('node:https');
const dns = require('node:dns').promises;
const { publicAddress } = require('../server.cjs');
const samples = [
 ['seiko-fr','Seiko France SRPG35','https://www.seikowatches.com/fr-fr/products/5sports/srpg35'],
 ['seiko-jp','Seiko Japon SBTM329','https://www.seikowatches.com/jp-ja/products/seikoselection/sbtm329'],
 ['seiko-store','Seiko boutique Japon SBTM321','https://store.seikowatches.com/products/sbtm321'],
 ['citizen-eu','Citizen EU NJ0150-81Z','https://citizenwatch.eu/en/p/nj0150-81z/'],
 ['citizen-jp','Citizen Japon NB1050-59A','https://citizen.jp/shop/g/gNB1050-59A/'],
 ['hamilton','Hamilton H38525721','https://www.hamiltonwatch.com/en-int/h38525721-jazzmaster-thinline-auto.html'],
 ['brew','Brew Metric (page candidate à vérifier)','https://www.brew-watches.com/products/metric-retro-dial'],
];
const fields = ['name','reference','image','price','diameter','thickness','lugToLug','movement','powerReserve','waterResistance','crystal'];
function text(v) { return typeof v === 'string' || typeof v === 'number' ? String(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim() : ''; }
function decode(s) { return s.replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>Number(n)<=0x10ffff?String.fromCodePoint(Number(n)):''); }
function attributes(tag) { const out={}; for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))out[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]); return out; }
function analyze(html,url) {
 const products=[], errors=[], groups=[];let scripts=0;
 function walk(o) { if(!o||typeof o!=='object')return; if(Array.isArray(o)){o.forEach(walk);return} const types=[].concat(o['@type']||[]); if(types.includes('Product'))products.push(o); if(types.includes('ProductGroup'))groups.push(o); for(const [k,v] of Object.entries(o))if(k!=='offers'&&k!=='additionalProperty')walk(v); }
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  if(attributes(m[1]).type?.toLowerCase()!=='application/ld+json')continue;scripts++;
  try { walk(JSON.parse(m[2].trim())); } catch { errors.push('JSON-LD illisible'); }
 }
 const meta={};for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=attributes(m[0]);if(a.content)meta[a.property||a.name]=a.content;}
 const title=decode(text((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||''));
 const mapping={diameter:/^(case diameter|diameter|diamètre(?: du boîtier)?|ケース径)$/i,thickness:/^(case thickness|thickness|épaisseur|厚さ)$/i,lugToLug:/^(lug[- ]to[- ]lug|corne à corne)$/i,movement:/^(movement|mouvement|caliber|calibre|駆動方式|キャリバー)$/i,powerReserve:/^(power reserve|réserve de marche|駆動期間)$/i,waterResistance:/^(water resistance|étanchéité|防水)$/i,crystal:/^(crystal|glass|verre|ガラス材質)$/i};
 const candidates=products.map((p,index)=>{
  const extracted={};const set=(field,value,source)=>{const v=text(value);if(v)extracted[field]={value:v,source}};
  set('name',p.name,'JSON-LD Product.name');set('reference',p.mpn||p.sku,'JSON-LD Product.mpn/sku');
  const im=[].concat(p.image||[])[0];set('image',typeof im==='object'?im.url||im.contentUrl:im,'JSON-LD Product.image');
  const offers=[].concat(p.offers||[]); const offer=offers.find(o=>o&&o.price!=null);if(offer)set('price',String(offer.price)+' '+(offer.priceCurrency||''),'JSON-LD Product.offers (prix source, devise non convertie)');
  for(const prop of [].concat(p.additionalProperty||[]))for(const [field,pattern]of Object.entries(mapping))if(pattern.test(text(prop?.name)))set(field,text(prop.value)+(prop.unitText?' '+prop.unitText:''),'JSON-LD additionalProperty: '+prop.name);
  return {index,fields:extracted,missing:fields.filter(f=>!extracted[f]),description:text(p.description),url:text(p.url)};
 });
 return {url,jsonLdScripts:scripts,parseErrors:errors,productGroups:groups.length,candidates,metadata:{title,ogTitle:meta['og:title']||'',ogImage:meta['og:image']||'',description:meta.description||meta['og:description']||''},requiresProductSelection:products.length>1,accuracy:'Non évaluée : nécessite comparaison manuelle à la fiche. Présence de données ≠ exactitude.'};
}
async function download(source,redirects=0) {
 const u=new URL(source);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||redirects>4)throw Error('URL HTTPS publique requise');
 const addresses=await dns.lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw Error('Adresse non publique refusée');const pinned=addresses[0];
 return new Promise((resolve,reject)=>{
  const req=https.get(u,{headers:{'User-Agent':'WatchCollection-Benchmark/1.0','Accept':'text/html','Accept-Encoding':'identity'},lookup:(_h,o,cb)=>o.all?cb(null,[pinned]):cb(null,pinned.address,pinned.family)},res=>{
   if([301,302,303,307,308].includes(res.statusCode)){res.resume();download(new URL(res.headers.location,u).href,redirects+1).then(resolve,reject);return}
   if(res.statusCode!==200){res.resume();reject(Error('HTTP '+res.statusCode));return}
   if(!/text\/html|application\/xhtml\+xml/i.test(res.headers['content-type']||'')){res.resume();reject(Error('Contenu non HTML'));return}
   let size=0;const chunks=[];res.on('data',c=>{size+=c.length;if(size>4*1024*1024){req.destroy(Error('Page > 4 Mo'));return}chunks.push(c)});res.on('error',reject);res.on('end',()=>resolve({html:Buffer.concat(chunks).toString('utf8'),finalUrl:u.href}));
  });req.setTimeout(15000,()=>req.destroy(Error('Timeout 15 secondes')));req.on('error',reject);
 });
}
async function main() {
 const args=process.argv.slice(2);const option=n=>{const i=args.indexOf(n);return i<0?null:args[i+1]};
 const input=option('--input-dir'), save=option('--save-html'),output=option('--output')||'/tmp/watch-product-benchmark.json';
 const results=await Promise.all(samples.map(async([id,label,url])=>{
  const start=Date.now();try{const page=input?{html:await fs.readFile(path.join(input,id+'.html'),'utf8'),finalUrl:url}:await download(url);if(save){await fs.mkdir(save,{recursive:true});await fs.writeFile(path.join(save,id+'.html'),page.html)}return{id,label,status:input?'local-snapshot':'downloaded',durationMs:Date.now()-start,...analyze(page.html,page.finalUrl)}}catch(e){return{id,label,url,status:'unavailable',durationMs:Date.now()-start,error:e.code||e.message}}
 }));
 const report={date:new Date().toISOString(),mode:input?'local-snapshots':'direct-node-https',note:'Aucun changement de collection. Pas de contournement réseau. URL Brew candidate non vérifiée. Comparaison IA non exécutée.',fields,results};await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
 for(const r of results)console.log(r.id+': '+r.status+(r.error?' — '+r.error:' — '+r.candidates.length+' Product, champs: '+r.candidates.map(c=>Object.keys(c.fields).length+'/'+fields.length).join(', ')));console.log('Rapport : '+output);
}
module.exports={analyze,download,samples};if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1});
