export const themeIds = ['classic','kyoto','sakura','soda','lemon','jeju','forest','camp','hawaii','winter','onsen','desert','paris','film','rail','cafe','love','cherry','nordic','mono','seoul','cosmos','aurora','arcade'] as const;
export const stickerIds = ['maple','sakura','sun','palm','plane','sparkles','coffee','moon','party','camera','cherries','strawberry','tent','snow','wave','flower','heart','butterfly','rainbow','star','compass','ticket','baggage','lemon','desert','cactus','train','shell'] as const;
export type ThemeId=typeof themeIds[number];
export type StickerId=typeof stickerIds[number];
export type StickerZone='cover'|'workspace';
export type Decoration={id:string;asset:StickerId;zone:StickerZone;x:number;y:number;size:number;rotation:number};
export type Appearance={themeId:ThemeId;theme:string;dark:boolean;coverMode:'photo'|'art';decorations:Decoration[];stickerMotion:boolean};
export type ThemePreset={id:ThemeId;name:string;description:string;group:string;accent:string;secondary:string;paper:string;surface:string;ink:string;coverA:string;coverB:string;frame:string;pattern:string;stickers:StickerId[];night:boolean};
const make=(id:ThemeId,name:string,description:string,group:string,accent:string,secondary:string,paper:string,ink:string,coverA:string,coverB:string,frame:string,pattern:string,stickers:StickerId[],night=false):ThemePreset=>({id,name,description,group,accent,secondary,paper,ink,coverA,coverB,frame,pattern,stickers,surface:'#ffffff',night});
export const themes:ThemePreset[]=[
make('classic','그린 여권','첫 여행을 담는 담백한 초록','감성·기록','#237c66','#bdd5bd','#f6f9f3','#293e32','#deedda','#bfdac9','postcard','none',['compass','plane','baggage']),
make('kyoto','교토의 가을','단풍빛 종이 위, 느린 산책','계절','#995337','#dfb375','#f6f0e5','#493b2f','#f3dfba','#d7b08c','washi','speckles',['maple','coffee','camera']),
make('sakura','벚꽃 우체국','꽃잎처럼 보드라운 봄의 편지','계절','#ac4b70','#e6a3b6','#fff4f5','#633b50','#f8d2df','#fff0d9','scallop','dots',['sakura','butterfly','heart']),
make('soda','바다 소다','청량한 파도와 여름의 조각','자연·휴식','#227699','#83c9d9','#edf8fc','#2e4b5b','#b9e6ef','#d3efff','wave','waves',['wave','shell','sun']),
make('lemon','레몬 피크닉','노란 체크보, 햇볕 아래 소풍','발랄·키치','#7b6424','#e3cb65','#fffcec','#514a31','#f7e9a2','#eef2b6','ribbon','gingham',['lemon','sun','flower']),
make('jeju','귤빛 제주','주황빛 과즙과 섬의 여유','자연·휴식','#ad5b20','#e9ae69','#fff5e8','#62412c','#ffcf90','#f5e2b5','scallop','dots',['sun','palm','camera']),
make('forest','숲속 오두막','초록 이끼와 고요한 숨','자연·휴식','#426c4c','#9db58b','#f1f4e8','#35462d','#c7d5ae','#dce6ca','botanical','botanical',['tent','flower','butterfly']),
make('camp','캠핑 수첩','낡은 크라프트지에 모은 모험','자연·휴식','#6d6635','#b4a16c','#f1ecdd','#4b4734','#d8cda9','#b7bf92','ticket','grid',['tent','compass','moon']),
make('hawaii','알로하 엽서','야자수 그늘 아래의 휴가','자연·휴식','#187b76','#e6a086','#eef8ef','#24504b','#a9dacc','#efcea6','postcard','stripes',['palm','sun','shell']),
make('winter','눈꽃 산장','포근한 겨울과 차가운 하늘','계절','#4b7096','#aebfd6','#f1f6fc','#354a62','#c6dced','#ede9f5','scallop','stars',['snow','coffee','star']),
make('onsen','느긋한 온천','부드러운 모래빛, 쉼표 하나','자연·휴식','#876348','#cdb294','#f7f1e7','#53483c','#ead8bb','#ded6be','washi','speckles',['coffee','flower','moon']),
make('desert','사막의 일몰','붉은 모래 언덕과 노을','자연·휴식','#a6543b','#d8a27f','#fcf0e8','#683f34','#eab69c','#efcf9f','postcard','waves',['desert','cactus','sun']),
make('paris','파리의 줄무늬','파란 리본과 한 장의 티켓','도시·야경','#3c5994','#bdcae5','#f6f3ea','#333e59','#c8d7f0','#ede4cf','ribbon','stripes',['camera','coffee','ticket']),
make('film','유럽 필름','오래 꺼내 보고 싶은 여행','감성·기록','#785e42','#c4aa7f','#f5efe2','#4d4438','#dfcaa5','#f1dfbd','film','speckles',['camera','ticket','baggage']),
make('rail','낭만 열차','기차표 한 장으로 시작하는 이야기','감성·기록','#365b71','#b0c4c6','#eef2ed','#354951','#bfcfd3','#e7ddbf','ticket','grid',['train','ticket','compass']),
make('cafe','디저트 산책','크림과 초콜릿, 달콤한 오후','감성·기록','#835f4f','#cba78e','#fcf5ed','#57453d','#e9d3c1','#f6e6d3','ribbon','gingham',['coffee','strawberry','camera']),
make('love','러브레터','둘이 모은 순간을 분홍 봉투에','감성·기록','#a34f62','#d3a1aa','#fff4f2','#663d47','#f3d0d4','#f7e2db','polaroid','dots',['heart','sakura','camera']),
make('cherry','체리 온 탑','새빨간 체리, 장난스러운 도트','발랄·키치','#b13c49','#ee9b9e','#fff4f1','#703a40','#f8c6c9','#ffe8cc','scallop','dots',['cherries','heart','party']),
make('nordic','북유럽의 아침','넓은 여백과 맑은 색의 조각','감성·기록','#517285','#adc3cc','#f4f7f5','#3d5158','#d5e2df','#ebe7d4','minimal','none',['sun','flower','coffee']),
make('mono','모노 시티','흑백 필름에 기록한 도시','도시·야경','#4b4b53','#b6b3b7','#f4f3f1','#37373c','#dcdbd8','#f2f0eb','film','grid',['camera','baggage','ticket']),
make('seoul','서울의 네온','깊은 밤, 분홍빛 도시의 불빛','도시·야경','#a83b9b','#ed9ee5','#f6eef9','#413148','#f2c3ed','#c8b4eb','neon','grid',['party','moon','camera'],true),
make('cosmos','별빛 여행자','멀리 떠나고 싶은 보랏빛 우주','도시·야경','#7051b0','#c5acf0','#f5f0fc','#49375f','#d6c1f2','#b7c9f0','cosmic','stars',['star','moon','sparkles'],true),
make('aurora','오로라의 밤','빙하 위로 번지는 신비한 빛','도시·야경','#297e74','#a2dbca','#edf8f4','#2b514c','#b3e0cd','#bfcde9','cosmic','waves',['snow','star','wave'],true),
make('arcade','레트로 아케이드','픽셀과 보라색, 신나는 모험','발랄·키치','#7550a0','#d0a0df','#f7f0fb','#54366c','#e6c5ed','#c5c2f5','pixel','checkers',['party','star','rainbow']),
];
export const groups=['전체','자연·휴식','도시·야경','계절','감성·기록','발랄·키치'];
export const stickers:{id:StickerId;name:string;group:string;animated:boolean}[]=[
['maple','단풍','자연',false],['sakura','벚꽃','자연',false],['sun','햇살','자연',true],['palm','야자수','자연',false],['plane','비행기','여행',true],['sparkles','반짝임','기분',false],['coffee','커피','먹거리',true],['moon','초승달','자연',false],['party','축하','기분',true],['camera','카메라','여행',true],['cherries','체리','먹거리',false],['strawberry','딸기','먹거리',false],['tent','텐트','여행',false],['snow','눈꽃','자연',true],['wave','파도','자연',true],['flower','꽃','자연',false],['heart','하트','기분',true],['butterfly','나비','자연',true],['rainbow','무지개','기분',true],['star','별','기분',true],['compass','나침반','여행',false],['ticket','티켓','여행',false],['baggage','여행 가방','여행',false],['lemon','레몬','먹거리',false],['desert','사막','자연',false],['cactus','선인장','자연',false],['train','기차','여행',false],['shell','조개','자연',false],
].map(([id,name,group,animated])=>({id:id as StickerId,name:name as string,group:group as string,animated:animated as boolean}));
export const getTheme=(id?:string)=>themes.find(t=>t.id===id)||themes[0];
export const getSticker=(id:string)=>stickers.find(s=>s.id===id);
export function appearanceOf(t:Partial<Appearance>):Appearance{return {themeId:t.themeId||'classic',theme:t.theme||'#237c66',dark:t.dark||false,coverMode:t.coverMode||'photo',decorations:t.decorations||[],stickerMotion:t.stickerMotion??true};}
export function recommendedDecorations(id:ThemeId):Decoration[]{const t=getTheme(id);return t.stickers.map((asset,i)=>({id:crypto.randomUUID(),asset,zone:i===2?'workspace':'cover',x:i===0?70:i===1?88:84,y:i===0?35:i===1?30:50,size:i===0?76:i===1?50:62,rotation:i===0?-12:i===1?14:-8}));}
function rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function lum(hex:string){const a=rgb(hex).map(c=>c/255<=.04045?c/255/12.92:((c/255+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
export function contrast(a:string,b:string){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function accessibleAccent(hex:string,bg:string,dark:boolean){let a=rgb(hex),out=hex;for(let i=0;i<35&&contrast(out,bg)<4.5;i++){a=a.map(c=>dark?Math.min(255,Math.round(c+(255-c)*.1)):Math.max(0,Math.floor(c*.9)));out='#'+a.map(c=>c.toString(16).padStart(2,'0')).join('');}return out;}
export const patterns:Record<string,string>={none:'none',dots:'radial-gradient(var(--pattern-ink) 1px, transparent 1px)',grid:'linear-gradient(var(--pattern-ink) 1px,transparent 1px),linear-gradient(90deg,var(--pattern-ink) 1px,transparent 1px)',gingham:'repeating-linear-gradient(0deg,transparent 0 14px,var(--pattern-ink) 14px 28px),repeating-linear-gradient(90deg,transparent 0 14px,var(--pattern-ink) 14px 28px)',stripes:'repeating-linear-gradient(105deg,transparent 0 17px,var(--pattern-ink) 17px 19px)',stars:'radial-gradient(ellipse at 50% 50%,var(--pattern-ink) 0 1.5px,transparent 2px)',waves:'repeating-radial-gradient(ellipse at 0 0,transparent 0 25px,var(--pattern-ink) 26px 27px,transparent 28px 45px)',botanical:'repeating-linear-gradient(65deg,transparent 0 50px,var(--pattern-ink) 51px 52px,transparent 53px 70px)',speckles:'radial-gradient(var(--pattern-ink) 1px,transparent 1.5px),radial-gradient(var(--pattern-ink) .5px,transparent 1px)',checkers:'conic-gradient(var(--pattern-ink) 25%,transparent 0 50%,var(--pattern-ink) 0 75%,transparent 0)'};
export function themeVariables(a:Appearance):Record<string,string>{const t=getTheme(a.themeId),dark=a.dark;const bg=dark?(t.id==='aurora'?'#152d2c':t.id==='seoul'?'#221a30':t.id==='cosmos'?'#211d36':'#232728'):t.paper;const surface=dark?(t.id==='aurora'?'#213d39':t.id==='seoul'?'#30223e':t.id==='cosmos'?'#2e2848':'#303637'):t.surface;const accent=accessibleAccent(dark&&a.theme===t.accent?t.secondary:a.theme,bg,dark);return {'--accent':accent,'--on-accent':contrast(accent,'#ffffff')>=4.5?'#ffffff':'#14231f','--ink':dark?'#eeeaf1':t.ink,'--muted':dark?'#b9b3c2':accessibleAccent('#8b8886',bg,false),'--surface':surface,'--bg':bg,'--line':dark?'#54505e':t.secondary+'66','--soft':dark?'#ffffff0b':t.secondary+'26','--secondary':t.secondary,'--frame-paper':dark?surface:'#fffdf8','--cover-a':t.coverA,'--cover-b':t.coverB,'--cover-ink':t.ink,'--pattern-ink':dark?t.secondary+'0a':t.accent+'08','--theme-pattern':patterns[t.pattern]||'none'};}
