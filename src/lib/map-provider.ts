/** 외부 공급자 교체 지점. 비밀 키는 서버에서만 사용합니다. */
export class MapProviderError extends Error { constructor(public status:number,message:string){super(message);} }
export async function searchPlaces(query:string){
 const url=new URL(process.env.PLACE_SEARCH_URL||'https://photon.komoot.io/api/');url.searchParams.set('q',query.slice(0,150));url.searchParams.set('limit','8');
 try{const r=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error();const d=await r.json();return (d.features||[]).map((f:{properties:Record<string,string>;geometry:{coordinates:number[]}})=>({name:f.properties.name||query,address:[f.properties.country,f.properties.city,f.properties.street,f.properties.housenumber].filter(Boolean).join(' '),lng:f.geometry.coordinates[0],lat:f.geometry.coordinates[1]}));}
 catch{throw new MapProviderError(502,'장소 검색 서비스에 연결하지 못했습니다. 직접 입력으로 추가할 수 있습니다.');}
}
export async function directions(mode:string,coordinates:number[][]){
 if(!process.env.ORS_API_KEY)throw new MapProviderError(503,'실제 경로 조회 미연결 · ORS_API_KEY 설정이 필요합니다.');
 try{const r=await fetch('https://api.openrouteservice.org/v2/directions/'+mode+'/geojson',{method:'POST',headers:{Authorization:process.env.ORS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({coordinates}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error();const d=await r.json();if(!d.features?.[0]?.properties?.segments||!d.features[0].geometry?.coordinates)throw new Error();return d.features[0];}
 catch{throw new MapProviderError(502,'이 지역 또는 이동 방식의 실제 경로를 조회할 수 없습니다.');}
}
