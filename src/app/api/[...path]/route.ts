import { NextRequest,NextResponse } from 'next/server';
import { randomBytes,scryptSync,timingSafeEqual,createHash } from 'node:crypto';
import { readFile,writeFile,unlink } from 'node:fs/promises';
import path from 'node:path';
import { searchPlaces,directions,MapProviderError } from '@/lib/map-provider';
import { db,dataDir } from '@/lib/db';
import { tripSchema,type Trip,type User } from '@/lib/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
const token=()=>randomBytes(32).toString('hex');
const json=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class Fault extends Error{constructor(public status:number,message:string){super(message);}}
function fail(status:number,message:string):never{throw new Fault(status,message);}
function user(req:NextRequest):User{const t=req.cookies.get('triplan_session')?.value; const u=t?db.prepare('SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?').get(hash(t),Date.now()):null; if(!u)fail(401,'로그인이 필요합니다.');return u as User;}
function tripAccess(id:string,u:User,owner=false){const row=db.prepare('SELECT * FROM trips WHERE id=?').get(id) as {id:string;owner:string;data:string;version:number;share:string|null}|undefined;if(!row)fail(404,'여행을 찾을 수 없습니다.');if(row.owner!==u.id&&(owner||!db.prepare('SELECT 1 FROM members WHERE trip_id=? AND user_id=?').get(id,u.id)))fail(403,'이 여행에 접근할 권한이 없습니다.');return row;}
function rate(key:string,max=15){const now=Date.now();const r=db.prepare('SELECT * FROM attempts WHERE key=?').get(key) as {count:number;reset:number}|undefined; if(r&&r.reset>now&&r.count>=max)fail(429,'요청이 너무 많습니다. 잠시 후 다시 시도하세요.');db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset<? THEN 1 ELSE count+1 END,reset=CASE WHEN reset<? THEN excluded.reset ELSE reset END').run(key,now+900000,now,now);}
async function body(req:NextRequest){if(Number(req.headers.get('content-length')||0)>2_000_000)fail(413,'요청이 너무 큽니다.');const t=await req.text();if(t.length>2_000_000)fail(413,'요청이 너무 큽니다.');try{return JSON.parse(t);}catch{fail(400,'올바른 JSON이 아닙니다.');}}
function validTrip(raw:unknown):Trip{const r=tripSchema.safeParse(raw);if(!r.success)fail(400,r.error.issues[0]?.code==='custom'?r.error.issues[0].message:'여행 입력을 확인하세요. 이름, 날짜, 좌표와 금액이 허용 범위 안에 있어야 합니다.');return r.data;}
async function handler(req:NextRequest){try{
const p=req.nextUrl.pathname.replace(/^\/api\//,'').split('/');const method=req.method;
if(method!=='GET'){const origin=req.headers.get('origin');const allowed=process.env.APP_URL?new URL(process.env.APP_URL).origin:req.nextUrl.origin;if(origin&&origin!==allowed&&origin!==req.nextUrl.origin)fail(403,'허용되지 않은 요청 출처입니다.');}
if(p[0]==='auth'){
if(method==='GET'){try{return json({user:user(req)});}catch{return json({user:null});}}
if(p[1]==='logout'){if(method!=='POST')fail(405,'지원하지 않는 요청입니다.');const t=req.cookies.get('triplan_session')?.value;if(t)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(t));const r=json({ok:true});r.cookies.delete('triplan_session');return r;}
if(method!=='POST')fail(405,'지원하지 않는 요청입니다.');const b=await body(req);const email=String(b.email||'').trim().toLowerCase();rate('auth:'+email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail(400,'이메일 주소를 확인하세요.');const password=String(b.password||'');if(password.length<10||password.length>200)fail(400,'비밀번호는 10~200자로 입력하세요.');
let u=db.prepare('SELECT * FROM users WHERE email=?').get(email) as (User&{password:string})|undefined;
if(p[1]==='register'){const name=String(b.name||'').trim();if(!name||name.length>80)fail(400,'이름은 1~80자로 입력하세요.');if(u)fail(409,'이미 가입한 이메일입니다.');const salt=token();u={id:crypto.randomUUID(),email,name,password:salt+':'+scryptSync(password,salt,64).toString('hex')};db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(u.id,email,name,u.password);}
else if(p[1]==='login'){if(!u)fail(401,'이메일 또는 비밀번호를 확인하세요.');const [salt,value]=u.password.split(':');if(!timingSafeEqual(Buffer.from(value,'hex'),scryptSync(password,salt,64)))fail(401,'이메일 또는 비밀번호를 확인하세요.');}else fail(404,'없는 요청입니다.');
const t=token();db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(t),u!.id,Date.now()+7*86400000);const r=json({user:{id:u!.id,name:u!.name,email}});r.cookies.set('triplan_session',t,{httpOnly:true,sameSite:'lax',secure:req.nextUrl.protocol==='https:',path:'/',maxAge:604800});return r;
}
if(p[0]==='share'&&method==='GET'){const row=db.prepare('SELECT data FROM trips WHERE share=?').get(hash(p[1])) as {data:string}|undefined;if(!row)fail(404,'비활성화되었거나 없는 공유 링크입니다.');const t=JSON.parse(row.data) as Trip;return json({trip:{...t,flight:'',hotel:'',expenses:[],reservations:[],checks:[],costs:[],budget:0,places:t.places.filter(x=>x.day>0).map(x=>({...x,note:'',cost:0,photo:'',url:''}))}});}
const u=user(req);
if(p[0]==='accept'&&method==='POST'){const b=await body(req);const row=db.prepare('SELECT * FROM invites WHERE token=? AND expires>?').get(hash(String(b.token)),Date.now()) as {email:string;trip_id:string}|undefined;if(!row||row.email!==u.email)fail(403,'초대 이메일로 로그인했는지, 초대가 만료되었는지 확인하세요.');db.prepare('INSERT OR IGNORE INTO members VALUES(?,?)').run(row.trip_id,u.id);db.prepare('DELETE FROM invites WHERE token=?').run(hash(b.token));return json({id:row.trip_id});}
if(p[0]==='search'&&method==='GET'){rate('search:'+u.id,60);const q=req.nextUrl.searchParams.get('q')||'';if(q.length<2)fail(400,'검색어를 두 글자 이상 입력하세요.');return json({results:await searchPlaces(q)});}
if(p[0]==='route'&&method==='POST'){if(!process.env.ORS_API_KEY)fail(503,'실제 경로 조회 미연결 · ORS_API_KEY 설정이 필요합니다.');rate('route:'+u.id,60);const b=await body(req);if(!['foot-walking','driving-car'].includes(b.mode)||!Array.isArray(b.coordinates)||b.coordinates.length<2||b.coordinates.length>50||b.coordinates.some((c:unknown)=>!Array.isArray(c)||c.length!==2||!c.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n))||Math.abs(c[0])>180||Math.abs(c[1])>90))fail(400,'경로 좌표를 확인하세요.');return json(await directions(b.mode,b.coordinates));}
if(p[0]!=='trips')fail(404,'없는 요청입니다.');
if(!p[1]){
if(method==='GET')return json({trips:db.prepare('SELECT DISTINCT t.id,t.data,t.version,t.owner FROM trips t LEFT JOIN members m ON t.id=m.trip_id WHERE t.owner=? OR m.user_id=?').all(u.id,u.id).map(r=>({id:r.id,trip:JSON.parse(r.data as string),version:r.version,owner:r.owner}))});
if(method==='POST'){const t=validTrip(await body(req));t.id=crypto.randomUUID();db.prepare('INSERT INTO trips(id,owner,data) VALUES(?,?,?)').run(t.id,u.id,JSON.stringify(t));return json({trip:t,version:1,owner:u.id},201);}
}
const id=p[1],row=tripAccess(id,u);
if(p[2]==='events'&&method==='GET'){let timer:ReturnType<typeof setInterval>;const stream=new ReadableStream({start(controller){const enc=new TextEncoder();controller.enqueue(enc.encode('data: sync\n\n'));timer=setInterval(()=>{try{tripAccess(id,u);controller.enqueue(enc.encode('data: sync\n\n'));}catch{clearInterval(timer);controller.close();}},2000);req.signal.addEventListener('abort',()=>{clearInterval(timer);try{controller.close();}catch{}},{once:true});},cancel(){clearInterval(timer);}});return new NextResponse(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'}});}
if(!p[2]){
if(method==='GET')return json({trip:JSON.parse(row.data),version:row.version,owner:row.owner,members:db.prepare('SELECT id,name,email FROM users WHERE id=? OR id IN (SELECT user_id FROM members WHERE trip_id=?)').all(row.owner,id)});
if(method==='PUT'){const b=await body(req),t=validTrip(b.trip);if(t.id!==id)fail(400,'여행 ID가 다릅니다.');const result=db.prepare('UPDATE trips SET data=?,version=version+1 WHERE id=? AND version=?').run(JSON.stringify(t),id,Number(b.version));if(!result.changes)fail(409,'동행인이 먼저 변경했습니다. 내 변경안을 복사한 후 최신 일정을 불러오세요.');const removed=db.prepare('SELECT id,reservation_id FROM files WHERE trip_id=?').all(id).filter(f=>!t.reservations.some(r=>r.id===f.reservation_id));for(const f of removed){db.prepare('DELETE FROM files WHERE id=?').run(f.id);await unlink(path.join(dataDir,String(f.id))).catch(()=>{});}const updated=db.prepare('SELECT version FROM trips WHERE id=?').get(id);return json({version:updated!.version});}
if(method==='DELETE'){tripAccess(id,u,true);const files=db.prepare('SELECT id FROM files WHERE trip_id=?').all(id);db.prepare('DELETE FROM trips WHERE id=?').run(id);await Promise.all(files.map(f=>unlink(path.join(dataDir,String(f.id))).catch(()=>{})));return json({ok:true});}
}
if(p[2]==='invite'&&method==='POST'){tripAccess(id,u,true);const b=await body(req);const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'초대할 이메일을 확인하세요.');const t=token();db.prepare('INSERT INTO invites VALUES(?,?,?,?)').run(hash(t),id,email,Date.now()+7*86400000);return json({token:t});}
if(p[2]==='share'){tripAccess(id,u,true);if(method==='DELETE'){db.prepare('UPDATE trips SET share=NULL WHERE id=?').run(id);return json({ok:true});}if(method==='POST'){const t=token();db.prepare('UPDATE trips SET share=? WHERE id=?').run(hash(t),id);return json({token:t});}}
if(p[2]==='comments'){
if(method==='GET')return json({comments:db.prepare('SELECT c.*,u.name FROM comments c JOIN users u ON c.user_id=u.id WHERE trip_id=? ORDER BY created').all(id)});
const b=await body(req);if(method==='POST'){const text=String(b.body||'').trim();if(!text||text.length>2000)fail(400,'댓글은 1~2,000자로 입력하세요.');if(!(JSON.parse(row.data) as Trip).places.some(x=>x.id===b.place_id))fail(400,'장소가 없습니다.');db.prepare('INSERT INTO comments VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),id,b.place_id,u.id,text,new Date().toISOString());return json({ok:true});}
const c=db.prepare('SELECT * FROM comments WHERE id=? AND trip_id=? AND user_id=?').get(b.id,id,u.id);if(!c)fail(403,'본인 댓글만 변경할 수 있습니다.');if(method==='DELETE')db.prepare('DELETE FROM comments WHERE id=?').run(b.id);else{const text=String(b.body||'').trim();if(!text||text.length>2000)fail(400,'댓글은 1~2,000자로 입력하세요.');db.prepare('UPDATE comments SET body=? WHERE id=?').run(text,b.id);}return json({ok:true});
}
if(p[2]==='files'){
if(method==='GET'&&!p[3])return json({files:db.prepare('SELECT * FROM files WHERE trip_id=?').all(id)});
if(method==='GET'||method==='DELETE'){const f=db.prepare('SELECT * FROM files WHERE id=? AND trip_id=?').get(p[3],id) as {id:string;name:string;mime:string}|undefined;if(!f)fail(404,'파일을 찾을 수 없습니다.');if(method==='DELETE'){await unlink(path.join(dataDir,f.id)).catch(()=>{});db.prepare('DELETE FROM files WHERE id=?').run(f.id);return json({ok:true});}return new NextResponse(await readFile(path.join(dataDir,f.id)),{headers:{'Content-Type':f.mime,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
if(method==='POST'){if(Number(req.headers.get('content-length')||0)>11*1024*1024)fail(413,'파일은 10MB 이하만 가능합니다.');const form=await req.formData(),file=form.get('file'),reservation=String(form.get('reservation')||'');if(!(file instanceof File)||file.size>10*1024*1024)fail(400,'10MB 이하의 파일을 선택하세요.');if(!(JSON.parse(row.data) as Trip).reservations.some(r=>r.id===reservation))fail(400,'예약을 찾을 수 없습니다.');const bytes=Buffer.from(await file.arrayBuffer());const isPdf=bytes.subarray(0,5).toString()==='%PDF-',isPng=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),isJpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,isWebp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';const mime=isPdf?'application/pdf':isPng?'image/png':isJpg?'image/jpeg':isWebp?'image/webp':null;if(!mime)fail(400,'PDF, PNG, JPEG, WebP 파일만 첨부할 수 있습니다.');const fid=crypto.randomUUID();await writeFile(path.join(dataDir,fid),bytes,{flag:'wx'});db.prepare('INSERT INTO files VALUES(?,?,?,?,?,?)').run(fid,id,reservation,file.name.slice(0,200),mime,file.size);return json({ok:true},201);}
}
fail(405,'지원하지 않는 요청입니다.');
}catch(e){if(e instanceof Fault||e instanceof MapProviderError)return json({error:e.message},e.status);console.error(e instanceof Error?e.message:'server error');return json({error:'서버 처리 또는 외부 연결에 실패했습니다. 잠시 후 다시 시도하세요.'},500);}}
export {handler as GET,handler as POST,handler as PUT,handler as PATCH,handler as DELETE};
