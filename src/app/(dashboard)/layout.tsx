import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AutoLogout from "@/components/AutoLogout";
import ToastProvider from "@/components/ToastProvider";
import "../layout.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-layout">
      <ToastProvider />
      <AutoLogout />
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
