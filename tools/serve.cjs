// Optional development server. The application itself needs only index.html.
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const port=Number(process.env.PORT||8765);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT doit être compris entre 1 et 65535.');
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return}
 if(!['/','/index.html'].includes(pathname)){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page introuvable');return}
 try{const html=await fs.readFile(path.join(__dirname,'../index.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html)}catch{res.writeHead(500);res.end('Impossible de lire index.html')}
});
server.listen(port,'127.0.0.1',()=>console.log(`Carnet servi sur le port ${port} (accès local).`));
server.on('error',error=>{console.error(error.message);process.exitCode=1});
