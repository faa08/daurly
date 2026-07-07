import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import CustomerServiceProvider from "@/components/CustomerServiceProvider";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import AdminChatNotificationAlert from "@/components/AdminChatNotificationAlert";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
 });
 
 const playfair = Playfair_Display({
   subsets: ["latin"],
   weight: ["600", "700"],
   variable: "--font-playfair",
   display: "swap",
 });
 
export const metadata: Metadata = {
  title: "Pelataran UMKM — Marketplace Produk Lokal Indonesia",
  description:
    "Temukan produk UMKM terbaik Indonesia: kuliner, kerajinan tangan, fashion lokal, dan jasa kreatif dari pengrajin lokal terpercaya.",
  keywords: "UMKM, produk lokal, marketplace Indonesia, kerajinan tangan, batik, kopi arabika",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
     title: "Pelataran UMKM — Marketplace Produk Lokal Indonesia",
     description: "Platform e-commerce khusus UMKM Indonesia",
     type: "website",
   },
 };
 
 export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   return (
     <html lang="id" className={`${jakarta.variable} ${playfair.variable}`}>
       <head>
         <link
           rel="stylesheet"
           href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
         />
       </head>
       <body style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
        <ToastProvider>
          <AuthSessionProvider>
            <CustomerServiceProvider>
              <MaintenanceGuard>
                {children}
                <AdminChatNotificationAlert />
              </MaintenanceGuard>
            </CustomerServiceProvider>
          </AuthSessionProvider>
        </ToastProvider>
       </body>
     </html>
   );
 }
