import type { Metadata } from "next";
import "./globals.css";
import { FinanceShell } from "@/components/finance-shell";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";
import { ApprovalProvider } from "@/contexts/ApprovalContext";

export const metadata: Metadata = {
  title: "PRODEV — Housing Finance System",
  description: "Sistem Informasi Pengelolaan Keuangan Developer Perumahan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-100 antialiased">
        <ToastProvider>
          <AuthProvider>
            <ConfirmDialogProvider>
              <ApprovalProvider>
                <FinanceShell>{children}</FinanceShell>
              </ApprovalProvider>
            </ConfirmDialogProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
