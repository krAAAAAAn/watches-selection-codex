const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const {chromium}=require('playwright');const {existsSync}=require('node:fs');const {createServer}=require('../server.cjs');
(async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'watch-sync-')),password='test-only-password';let server=createServer({password,dataDir:dir}),browser;
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let base='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await fetch(base+'/api/collection')).status,401);
  assert.equal((await fetch(base+'/.collection-data/collection.json')).status,404);
  assert.equal((await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://foreign.example'},body:JSON.stringify({password})})).status,403);
  assert.equal((await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'wrong-password'})})).status,401);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined)});
  const contexts=await Promise.all([browser.newContext(),browser.newContext()]);for(const c of contexts)await c.route('https://**',r=>r.abort());
  const [a,b]=await Promise.all(contexts.map(c=>c.newPage()));const errors=[];for(const p of [a,b])p.on('pageerror',e=>errors.push(e.message));
  async function connect(page){await page.goto(base);await page.locator('[data-connect]').first().waitFor();await page.locator('[data-connect]').first().click();await page.locator('#sharedPassword').fill(password);await page.locator('#loginButton').click();await page.locator('#syncDialog').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('à jour'))}
  const localServer=createServer({dataDir:dir});await new Promise(r=>localServer.listen(0,'127.0.0.1',r));
  try{await a.goto('http://127.0.0.1:'+localServer.address().port);await a.getByText('Ce serveur est en mode local :',{exact:false}).waitFor();assert.deepEqual(await fs.readdir(dir),[])}finally{await new Promise(r=>localServer.close(r))}
  await connect(a);assert.equal(JSON.parse(await fs.readFile(path.join(dir,'collection.json'),'utf8')).collection.watches.length,41);await connect(b);
  async function notes(page){await page.locator('[data-page="catalogue"]').click();await page.locator('[data-detail="watch-35"]').click()}
  await notes(a);await a.locator('#note').fill('Note partagée depuis A');await a.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('à jour'));
  await b.locator('[data-refresh]').click();await notes(b);assert.equal(await b.locator('#note').inputValue(),'Note partagée depuis A');
  // A stale browser editor cannot overwrite a newer collection.
  await b.locator('#editWatch').click();await a.locator('#note').fill('Version serveur plus récente');await a.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('à jour'));
  await b.locator('#summary').fill('Brouillon concurrent de B');await b.locator('#watchForm [type="submit"]').click();await b.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('Conflit'));
  let record=JSON.parse(await fs.readFile(path.join(dir,'collection.json'),'utf8'));assert.equal(record.collection.watches.find(w=>w.id==='watch-35').notes,'Version serveur plus récente');assert.notEqual(record.collection.watches.find(w=>w.id==='watch-35').summary,'Brouillon concurrent de B');
  b.once('dialog',d=>d.accept());await b.locator('[data-server-version]').click();await b.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('à jour'));assert.equal(await b.locator('#note').inputValue(),'Version serveur plus récente');
  // Network interruption: preserve the draft on reload and sync it later.
  await b.route('**/api/**',r=>r.abort());await b.locator('#note').fill('Brouillon hors ligne');await b.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('Non synchronisé'));
  b.once('dialog',d=>d.accept());await b.reload();await b.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('Non synchronisé'));await notes(b);assert.equal(await b.locator('#note').inputValue(),'Brouillon hors ligne');
  await b.unroute('**/api/**');await b.locator('[data-retry]').click();await b.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('à jour'));
  record=JSON.parse(await fs.readFile(path.join(dir,'collection.json'),'utf8'));assert.equal(record.collection.watches.find(w=>w.id==='watch-35').notes,'Brouillon hors ligne');
  const download=await Promise.all([b.waitForEvent('download'),b.locator('[data-html]').click()]).then(x=>x[0]);assert.ok(!(await fs.readFile(await download.path(),'utf8')).includes(password));
  // Direct concurrent PUTs with the same revision: exactly one may commit.
  const login=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const cookie=login.headers.get('set-cookie').split(';')[0];
  assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));assert.ok(login.headers.get('set-cookie').includes('SameSite=Strict'));
  const headers={'Content-Type':'application/json',Cookie:cookie};const current=await(await fetch(base+'/api/collection',{headers})).json();const body=JSON.stringify(current);
  const pair=await Promise.all([fetch(base+'/api/collection',{method:'PUT',headers,body}),fetch(base+'/api/collection',{method:'PUT',headers,body})]);assert.deepEqual(pair.map(r=>r.status).sort(),[200,409]);
  const invalid=await fetch(base+'/api/collection',{method:'PUT',headers,body:JSON.stringify({revision:current.revision+1,collection:{version:9}})});assert.equal(invalid.status,400);
  assert.deepEqual(errors,[]);await browser.close();browser=null;
  // Data survives process restart; corrupt disk data is preserved, not reset.
  await new Promise(r=>server.close(r));server=createServer({password,dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
  const relog=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const newHeaders={Cookie:relog.headers.get('set-cookie').split(';')[0]};const afterRestart=await(await fetch(base+'/api/collection',{headers:newHeaders})).json();assert.equal(afterRestart.collection.watches.find(w=>w.id==='watch-35').notes,'Brouillon hors ligne');
  await fs.writeFile(path.join(dir,'collection.json'),'broken-data');assert.equal((await fetch(base+'/api/collection',{headers:newHeaders})).status,500);assert.equal(await fs.readFile(path.join(dir,'collection.json'),'utf8'),'broken-data');
  console.log('PASS — serveur réel : deux navigateurs indépendants, notes partagées, conflits sans écrasement, reprise hors ligne, écriture concurrente, accès privé, validation, redémarrage et sauvegarde illisible préservée.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await fs.rm(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
