import {cp,mkdir,rm,readFile,writeFile,symlink} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(),stage=path.join(root,'.pages-build');
const base=process.env.NEXT_PUBLIC_BASE_PATH||'/Triplan';
if(!/^\/[A-Za-z0-9._-]+$/.test(base))throw new Error('Pages base path must be a single repository name.');
await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
// Export from a separate generated source tree; the full server is never moved or modified.
await cp(path.join(root,'src'),path.join(stage,'src'),{recursive:true,filter:p=>!p.startsWith(path.join(root,'src/app/api'))&&!['db.ts','map-provider.ts'].includes(path.basename(p))});
await cp(path.join(root,'public'),path.join(stage,'public'),{recursive:true});
await cp(path.join(root,'package.json'),path.join(stage,'package.json'));
await cp(path.join(root,'package-lock.json'),path.join(stage,'package-lock.json'));
const ts=JSON.parse(await readFile(path.join(root,'tsconfig.json'),'utf8'));ts.exclude=['node_modules'];await writeFile(path.join(stage,'tsconfig.json'),JSON.stringify(ts,null,2));
await symlink(path.join(root,'node_modules'),path.join(stage,'node_modules'),'dir');
await writeFile(path.join(stage,'next.config.mjs'),`export default {output:'export',basePath:${JSON.stringify(base)},trailingSlash:true,images:{unoptimized:true},turbopack:{root:${JSON.stringify(root)}}};\n`);
const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build',stage],{cwd:root,env:{...process.env,NEXT_PUBLIC_PAGES_DEMO:'true',NEXT_PUBLIC_BASE_PATH:base,NEXT_TELEMETRY_DISABLED:'1'},stdio:'inherit'});
const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});if(code)process.exit(Number(code));
await rm(path.join(root,'out'),{recursive:true,force:true});await cp(path.join(stage,'out'),path.join(root,'out'),{recursive:true});await writeFile(path.join(root,'out','.nojekyll'),'');
console.log('Pages static demo exported to out'+base+' (served under repository path).');
