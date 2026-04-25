import "@/app/globals.css";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Hivon Blog Platform",
  description: "A role-aware blogging platform built with Next.js and Supabase."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <Header user={user} />
          <main className="page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
