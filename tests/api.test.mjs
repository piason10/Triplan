import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleTrip} from '../src/lib/model.ts';
const base=process.env.TEST_URL||'http://localhost:3000';
async function call(path,method='GET',body,cookie=''){const r=await fetch(base+'/api/'+path,{method,headers:{...(body instanceof FormData?{}:{'Content-Type':'application/json'}),Cookie:cookie},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
test('서버 저장·초대·동시 수정·개인정보·파일 권한·공유 철회',async()=>{
const suffix=crypto.randomUUID();const register=async(name)=>{const x=await call('auth/register','POST',{name,email:`${name}-${suffix}@example.test`,password:'test-only-password-123'});assert.equal(x.status,200);return x;};
const a=await register('owner'),b=await register('member'),c=await register('stranger');
const made=await call('trips','POST',sampleTrip(),a.cookie);assert.equal(made.status,201);const id=made.data.trip.id;const other=await call('trips','POST',sampleTrip(),a.cookie);assert.equal(other.status,201);const otherId=other.data.trip.id;
try{
assert.equal((await call('trips/'+id)).status,401);assert.equal((await call('trips/'+id,'GET',undefined,c.cookie)).status,403);
const inv=await call(`trips/${id}/invite`,'POST',{email:`member-${suffix}@example.test`},a.cookie);assert.equal(inv.status,200);assert.equal((await call('accept','POST',{token:inv.data.token},c.cookie)).status,403);assert.equal((await call('accept','POST',{token:inv.data.token},b.cookie)).status,200);
const snap=await call('trips/'+id,'GET',undefined,b.cookie);assert.equal(snap.status,200);assert.equal(snap.data.members.length,2);
const t=snap.data.trip;t.title='공동 수정 검증';t.themeId='sakura';t.theme='#ac4b70';t.coverMode='art';t.decorations=[{id:'sticker-test',asset:'sakura',zone:'cover',x:75,y:30,size:64,rotation:-10}];const update=await call('trips/'+id,'PUT',{trip:t,version:1},b.cookie);assert.equal(update.status,200);assert.equal((await call('trips/'+id,'PUT',{trip:t,version:1},a.cookie)).status,409);const restored=(await call('trips/'+id,'GET',undefined,a.cookie)).data.trip;assert.equal(restored.title,t.title);assert.equal(restored.themeId,'sakura');assert.deepEqual(restored.decorations,t.decorations);assert.equal((await call('trips/'+otherId,'GET',undefined,a.cookie)).data.trip.themeId,'classic');
assert.equal((await call(`trips/${id}/comments`,'POST',{place_id:'p1',body:'테스트 댓글'},b.cookie)).status,200);const comments=(await call(`trips/${id}/comments`,'GET',undefined,a.cookie)).data.comments;assert.equal((await call(`trips/${id}/comments`,'PATCH',{id:comments[0].id,body:'변조'},a.cookie)).status,403);assert.equal((await call(`trips/${id}/comments`,'PATCH',{id:comments[0].id,body:'수정 댓글'},b.cookie)).status,200);
const f=new FormData();f.set('reservation','r1');f.set('file',new File(['%PDF-1.4\n%%EOF'],'ticket.pdf',{type:'application/pdf'}));assert.equal((await call(`trips/${id}/files`,'POST',f,a.cookie)).status,201);const files=(await call(`trips/${id}/files`,'GET',undefined,b.cookie)).data.files;assert.equal(files.length,1);assert.equal((await call(`trips/${id}/files/${files[0].id}`,'GET',undefined,c.cookie)).status,403);
const fake=new FormData();fake.set('reservation','r1');fake.set('file',new File(['<script>alert(1)</script>'],'ticket.pdf',{type:'application/pdf'}));assert.equal((await call(`trips/${id}/files`,'POST',fake,a.cookie)).status,400);
assert.equal((await call(`trips/${id}/share`,'POST',{},b.cookie)).status,403);const share=await call(`trips/${id}/share`,'POST',{},a.cookie);const shared=await call('share/'+share.data.token);assert.equal(shared.status,200);assert.equal(shared.data.trip.themeId,'sakura');assert.deepEqual(shared.data.trip.decorations,t.decorations);assert.equal(shared.data.trip.expenses.length,0);assert.equal(shared.data.trip.reservations.length,0);assert.equal(shared.data.trip.hotel,'');assert.equal(shared.data.trip.places[0].note,'');assert.ok(shared.data.trip.places.every(p=>p.day>0));assert.equal(shared.data.trip.places[0].cost,0);
await call(`trips/${id}/share`,'DELETE',{},a.cookie);assert.equal((await call('share/'+share.data.token)).status,404);
const stream=await fetch(base+`/api/trips/${id}/events`,{headers:{Cookie:b.cookie}});assert.equal(stream.headers.get('content-type'),'text/event-stream');const reader=stream.body.getReader();const chunk=await reader.read();assert.match(new TextDecoder().decode(chunk.value),/data: sync/);await reader.cancel();
const invalid={...t,end:'2026-01-01'};assert.equal((await call('trips/'+id,'PUT',{trip:invalid,version:2},a.cookie)).status,400);
assert.equal((await call('route','POST',{coordinates:[[135,35],[135.1,35.1]],mode:'foot-walking'},a.cookie)).status,503);
const csrf=await fetch(base+'/api/trips/'+id,{method:'DELETE',headers:{Cookie:a.cookie,Origin:'https://evil.invalid'}});assert.equal(csrf.status,403);
assert.equal((await call('trips/'+id,'DELETE',undefined,b.cookie)).status,403);
}finally{assert.equal((await call('trips/'+id,'DELETE',undefined,a.cookie)).status,200);assert.equal((await call('trips/'+otherId,'DELETE',undefined,a.cookie)).status,200);}
assert.equal((await call('trips/'+id,'GET',undefined,a.cookie)).status,404);
});
