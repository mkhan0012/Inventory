import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AutoLogout from "@/components/AutoLogout";
import { Toaster } from "react-hot-toast";
import "../layout.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-layout">
      <Toaster position="top-center" />
      <AutoLogout />
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
