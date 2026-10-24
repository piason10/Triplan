import type { Metadata } from 'next';
import './globals.css';
import './themes.css';
import 'leaflet/dist/leaflet.css';
export const metadata: Metadata = { title: 'Triplan · 함께 만드는 여행', description: '가고 싶은 순간을 모아, 우리다운 여행으로.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
