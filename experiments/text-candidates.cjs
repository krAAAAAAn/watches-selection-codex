// Second experimental pass: generic labels in text, no per-site selector.
// Outputs candidates, not an approved watch. Recommendations and hidden text
// can contaminate these candidates; manual checking remains required.
const fs=require('node:fs/promises');
const aliases={
 diameter:['diamètre','diameter','case diameter','case size','diameter (x-axis)','ケースサイズ'],
 thickness:['épaisseur','thickness','case thickness','thickness (mm)','厚み','厚さ'],
 lugToLug:['corne à corne','lug-to-lug','lug to lug'],
 movement:['mouvement','type de mouvement','numéro du calibre','movement','caliber','calibre','キャリバーno','キャリバーno.','駆動方式','動力'],
 powerReserve:['autonomie','power reserve','réserve de marche','駆動期間','持続時間'],
 waterResistance:['étanchéité','water resistance','water resistant','防水','防水性能'],
 crystal:['composition du verre','crystal','glass','glas','verre','ガラス','ガラス材質'],
};
function lines(html){return html.replace(/<!--[^]*?-->/g,'').replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi,'').replace(/<\/?(?:p|br|div|dt|dd|tr|td|th|li|h[1-6])\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>Number(n)<=0x10ffff?String.fromCodePoint(Number(n)):'').replace(/&#x([0-9a-f]+);/gi,(_,n)=>parseInt(n,16)<=0x10ffff?String.fromCodePoint(parseInt(n,16)):'').split('\n').map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);}
function candidates(html){
 const rows=lines(html),found={};
 for(let i=0;i<rows.length;i++)for(const [field,names]of Object.entries(aliases)){
  const row=rows[i];let value='',label='';
  for(const name of names){
   if(row.replace(/[:：]\s*$/,'').toLowerCase()===name){value=rows[i+1]||'';label=row;break;}
   const lower=row.toLowerCase();if(lower.startsWith(name+':')||lower.startsWith(name+'：')){value=row.slice(name.length+1).trim();label=row.slice(0,name.length);break;}
   // Japanese Shopify specifications use space-separated labels and values.
   if(/^[\u3000-\u9fff]/.test(name)&&lower.startsWith(name+' ')){value=row.slice(name.length).trim();label=name;break;}
  }
  if(!value||value.length>250)continue;
  (found[field]??=[]).push({value,quote:label+' '+value,line:i+1});
 }
 return found;
}
module.exports={candidates,lines,aliases};
if(require.main===module){Promise.all(process.argv.slice(2).map(async p=>({file:p,candidates:candidates(await fs.readFile(p,'utf8'))}))).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1});}
