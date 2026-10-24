/** Build-time flags; no credentials or server URLs are embedded in Pages. */
export const IS_PAGES=process.env.NEXT_PUBLIC_PAGES_DEMO==='true';
export const BASE_PATH=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
export const appUrl=(pathname:string)=>BASE_PATH+(pathname.startsWith('/')?pathname:'/'+pathname);
export const PAGES_SERVER_MESSAGE='GitHub Pages 체험판에서는 서버에 연결되지 않습니다. 로그인·공동 편집·댓글·첨부·공유 링크는 Node 서버 버전에서 이용하세요.';
