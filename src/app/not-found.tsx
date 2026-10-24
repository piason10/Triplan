import {appUrl,IS_PAGES} from '@/lib/runtime';
export default function NotFound(){return <main className="loading-screen"><h1>길을 잠시 벗어났어요</h1><p>요청한 페이지를 찾을 수 없습니다.</p><a className="btn" href={appUrl('/')}>내 여행으로 돌아가기</a></main>;}
