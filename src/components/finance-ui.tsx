import React from "react";

/* ── Card ────────────────────────────────────────────────────────── */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 ${className}`}>{children}</div>;
}

/* ── Page Header ─────────────────────────────────────────────────── */
export function PageHeader({
  title, description, icon: Icon, action,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60 mb-6 no-print print:hidden">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────────────────── */
export function Btn({
  children, onClick, type = "button", variant = "primary", className = "", disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50 whitespace-nowrap";
  const v: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}
