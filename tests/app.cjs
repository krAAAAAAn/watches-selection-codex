const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const {existsSync}=require('node:fs');
const {chromium}=require('playwright');

(async()=>{
 const root=path.resolve(__dirname,'..'),html=await fs.readFile(path.join(root,'index.html'));
 const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  const executable=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':null);
  browser=await chromium.launch(executable?{executablePath:executable}:{});
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // External photos are independent of the data/editing workflow.
  await context.route('https://**',r=>r.abort());
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base);await page.locator('.card').first().waitFor();
  assert.equal(await page.locator('.card').count(),8);
  await page.locator('[data-page="catalogue"]').click();assert.equal(await page.locator('tbody tr').count(),41);
  await page.locator('#search').fill('Charlie Paris Concordia');assert.equal(await page.locator('tbody tr').count(),1);
  await page.locator('[data-detail="watch-35"]').click();await page.locator('#note').fill('Essai boutique : très agréable, <b>sans balise active</b>.');
  await page.reload();await page.locator('[data-page="catalogue"]').click();await page.locator('[data-detail="watch-35"]').click();
  assert.equal(await page.locator('#note').inputValue(),'Essai boutique : très agréable, <b>sans balise active</b>.');
  await page.locator('#editWatch').click();await page.locator('#summary').fill('Une description personnelle actualisée.');
  const price=page.locator('.specrow').filter({has:page.locator('input[value="Prix indicatif"]')});
  await price.locator('.specValue').fill('350 €');await page.locator('#watchForm [type="submit"]').click();
  assert.ok((await page.locator('.specgrid').innerText()).includes('350 €'), 'Form error: '+await page.locator('#formError').textContent()+' Dialog visible: '+await page.locator('#editor').isVisible()+' JS errors: '+JSON.stringify(errors));
  await page.locator('[data-page="collection"]').click();await page.locator('[data-next="0"]').click();
  const selectedName=await page.locator('.card').first().locator('h3').innerText();await page.locator('[data-choose="0"]').click();
  await page.reload();assert.equal(await page.locator('.card').first().locator('h3').innerText(),selectedName);
  await page.locator('#add').click();await page.locator('#modelName').fill('Ma montre test <img src=x onerror=alert(1)>');await page.locator('#summary').fill('Ajout manuel');await page.locator('#roles input[value="6"]').check();
  await page.locator('#photoUrl').fill('http://example.org/image.png');await page.locator('#watchForm [type="submit"]').click();
  assert.ok(await page.locator('#editor').isVisible());assert.ok((await page.locator('#formError').innerText()).includes('HTTPS'));
  await page.locator('#photoUrl').fill('');await page.locator('#watchForm [type="submit"]').click();
  assert.equal(await page.locator('.detail h1').innerText(),'Ma montre test <img src=x onerror=alert(1)>');assert.equal(await page.locator('.detail h1 img').count(),0);
  await page.locator('[data-page="catalogue"]').click();await page.locator('#search').fill('');assert.equal(await page.locator('tbody tr').count(),42);
  const download=await Promise.all([page.waitForEvent('download'),page.locator('[data-export]').click()]).then(x=>x[0]);
  const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(exported.watches.length,42);assert.ok(exported.chosen[0]);assert.equal(exported.watches.find(w=>w.id==='watch-35').notes,'Essai boutique : très agréable, <b>sans balise active</b>.');
  // Invalid import must not change the current collection.
  await page.locator('#importFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.startsWith('Import refusé'));
  assert.equal(await page.locator('tbody tr').count(),42);
  const initial=await page.locator('#initialData').textContent();
  await page.locator('#importFile').setInputFiles({name:'original.json',mimeType:'application/json',buffer:Buffer.from(initial)});
  await page.locator('#importDialog').waitFor({state:'visible'});await page.locator('#cancelImport').click();assert.equal(await page.locator('tbody tr').count(),42);
  await page.locator('#importFile').setInputFiles({name:'original.json',mimeType:'application/json',buffer:Buffer.from(initial)});
  await page.locator('#confirmImport').click();assert.equal(await page.locator('tbody tr').count(),41);
  await page.locator('#importFile').setInputFiles({name:'saved.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.locator('#confirmImport').click();assert.equal(await page.locator('tbody tr').count(),42);
  // Downloaded single-file HTML must bootstrap the same collection on a fresh origin.
  const htmlDownload=await Promise.all([page.waitForEvent('download'),page.locator('[data-html]').click()]).then(x=>x[0]);
  const downloadedHTML=await fs.readFile(await htmlDownload.path(),'utf8');assert.ok(downloadedHTML.includes('Une description personnelle actualisée.'));
  const fresh=await browser.newContext();const freshPage=await fresh.newPage();await fresh.route('https://**',r=>r.abort());await freshPage.route('http://127.0.0.1:**',r=>r.fulfill({contentType:'text/html',body:downloadedHTML}));
  await freshPage.goto(base);await freshPage.locator('[data-page="catalogue"]').click();assert.equal(await freshPage.locator('tbody tr').count(),42);await freshPage.locator('[data-detail="watch-35"]').click();assert.equal(await freshPage.locator('#note').inputValue(),exported.watches.find(w=>w.id==='watch-35').notes);await fresh.close();
  await page.reload();await page.locator('[data-page="catalogue"]').click();assert.equal(await page.locator('tbody tr').count(),42);
  await page.setViewportSize({width:390,height:844});await page.locator('[data-page="collection"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  // Simulate denied storage: editing remains usable, with an explicit temporary status.
  const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}}));await denied.route('https://**',r=>r.abort());const deniedPage=await denied.newPage();await deniedPage.goto(base);assert.ok((await deniedPage.locator('#saveState').innerText()).includes('temporaire'));await denied.close();
  // A second tab cannot silently overwrite a newer saved collection.
  const second=await context.newPage();await second.goto(base);await second.locator('[data-page="catalogue"]').click();await second.locator('[data-detail="watch-35"]').click();await second.locator('#note').fill('Note depuis un autre onglet');
  await page.waitForFunction(()=>document.querySelector('#saveState').textContent.includes('Autre onglet'));
  await page.locator('[data-page="catalogue"]').click();await page.locator('[data-detail="watch-35"]').click();await page.locator('#note').fill('Modification concurrente non sauvegardée');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('watch-selection.collection.v1')).watches.find(w=>w.id==='watch-35').notes),'Note depuis un autre onglet');
  await second.close();await page.reload();
  // Corrupt storage remains intact until an explicit recovery choice.
  await page.evaluate(()=>localStorage.setItem('watch-selection.collection.v1','broken-json'));await page.reload();assert.equal(await page.evaluate(()=>localStorage.getItem('watch-selection.collection.v1')),'broken-json');assert.ok(await page.locator('#recoverRaw').isVisible());
  assert.deepEqual(errors,[]);
  console.log('PASS — 41 fiches, persistance des notes et choix, édition, ajout manuel, validation HTTPS, échappement HTML, export/import et annulation, export HTML autonome, mobile, stockage refusé, conflit entre onglets et sauvegarde corrompue.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
