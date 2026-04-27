import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";
import { ActivityLogProvider } from "@/contexts/ActivityLogContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "Housing System",
  description: "Sistem Pengelolaan Perusahaan - Housing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MobileMenuProvider>
            <ActivityLogProvider>
              <ConfirmDialogProvider>
                <ToastProvider>
                  {children}
                  <ToastContainer />
                </ToastProvider>
              </ConfirmDialogProvider>
            </ActivityLogProvider>
          </MobileMenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
