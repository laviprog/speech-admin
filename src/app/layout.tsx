import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Slide, ToastContainer } from 'react-toastify';
import { bootstrapDefaultAdmin } from '@/lib/bootstrap';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Speech Admin',
  description: 'Admin panel for STT usage',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await bootstrapDefaultAdmin();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ToastContainer
          position="bottom-right"
          autoClose={2500}
          limit={3}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
        {children}
      </body>
    </html>
  );
}
