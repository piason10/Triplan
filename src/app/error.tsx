'use client';
import {appUrl,IS_PAGES} from '@/lib/runtime';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="loading-screen"><h1>여행을 불러오지 못했어요</h1><p>잠시 후 다시 시도해주세요. {IS_PAGES?'샘플은 이 브라우저에 저장됩니다.':'저장한 여행은 서버에 보관됩니다.'}</p><button className="btn" onClick={reset}>다시 시도</button><a href={appUrl('/')}>처음 화면으로</a></main>;}
