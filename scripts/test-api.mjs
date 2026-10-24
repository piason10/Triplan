import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const dir=await mkdtemp(path.join(tmpdir(),'triplan-test-'));
const port=process.env.TEST_PORT||'3199',url=`http://127.0.0.1:${port}`;
let output='';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',port,'-H','127.0.0.1'],{env:{...process.env,DATA_DIR:dir,APP_URL:url,ORS_API_KEY:'',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
try{
let ready=false;for(let i=0;i<80;i++){if(server.exitCode!==null)break;try{const r=await fetch(url+'/api/auth');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
if(!ready)throw new Error('테스트 서버 시작 실패. 먼저 npm run build를 실행하세요.\n'+output);
const child=spawn(process.execPath,['--experimental-strip-types','--test','tests/api.test.mjs'],{env:{...process.env,TEST_URL:url},stdio:'inherit'});
const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});if(code)process.exitCode=Number(code);
}finally{server.kill('SIGTERM');await new Promise(resolve=>{if(server.exitCode!==null)resolve();else server.once('exit',resolve);});await rm(dir,{recursive:true,force:true});}
