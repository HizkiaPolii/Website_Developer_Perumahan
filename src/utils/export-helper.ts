"use client";

// Helper to download a CSV file in the browser
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Convert a 2D array of cells to a CSV string compliant with Excel
function rowsToCSVString(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          if (cell === null || cell === undefined) return "";
          let val = String(cell);
          // If the cell contains comma, double quote or newline, wrap in quotes
          if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    )
    .join("\r\n");
}

// Recursive helper to flatten tree node structure of Chart of Accounts for CSV
function flattenNodesForCSV(nodes: any[], level = 0): { code: string; name: string; amount: number; level: number }[] {
  let result: any[] = [];
  if (!nodes || !Array.isArray(nodes)) return result;

  for (const n of nodes) {
    // Indent name based on hierarchy level with spaces for clean Excel viewing
    const indentedName = "  ".repeat(level) + n.name;
    result.push({
      code: n.code,
      name: indentedName,
      amount: n.balance || 0,
      level
    });
    if (n.children && n.children.length > 0) {
      result = [...result, ...flattenNodesForCSV(n.children, level + 1)];
    }
  }
  return result;
}

// 1. Export Laba Rugi (Income Statement)
export function exportIncomeStatementToCSV(isData: any, periodLabel = "Periode Berjalan") {
  const rows: (string | number | boolean | null | undefined)[][] = [
    ["LAPORAN LABA RUGI"],
    ["PRODEV - Housing Finance System"],
    [`Periode: ${periodLabel}`],
    ["Tanggal Unduh", new Date().toLocaleString("id-ID")],
    [],
    ["KODE AKUN", "NAMA AKUN", "NOMINAL (IDR)"]
  ];

  // A. PENDAPATAN
  rows.push(["", "PENDAPATAN", ""]);
  const flatPendapatan = flattenNodesForCSV(isData.pendapatan);
  flatPendapatan.forEach(item => {
    rows.push([item.code, item.name, item.amount]);
  });
  rows.push(["", "TOTAL PENDAPATAN", isData.totalPendapatan]);
  rows.push([]);

  // B. BEBAN
  rows.push(["", "BEBAN OPERASIONAL", ""]);
  const flatBeban = flattenNodesForCSV(isData.beban);
  flatBeban.forEach(item => {
    rows.push([item.code, item.name, item.amount]);
  });
  rows.push(["", "TOTAL BEBAN OPERASIONAL", isData.totalBeban]);
  rows.push([]);

  // C. LABA BERSIH
  rows.push(["", "LABA BERSIH", isData.labaBersih]);

  return rowsToCSVString(rows);
}

// 2. Export Neraca (Balance Sheet)
export function exportBalanceSheetToCSV(bsData: any, ecData: any, periodLabel = "Periode Berjalan") {
  const rows: (string | number | boolean | null | undefined)[][] = [
    ["LAPORAN NERACA (BALANCE SHEET)"],
    ["PRODEV - Housing Finance System"],
    [`Periode: ${periodLabel}`],
    ["Tanggal Unduh", new Date().toLocaleString("id-ID")],
    [],
    ["KODE AKUN", "NAMA AKUN", "SALDO (IDR)"]
  ];

  // A. AKTIVA (ASET)
  rows.push(["", "AKTIVA (ASET)", ""]);
  const flatAset = flattenNodesForCSV(bsData.aset);
  flatAset.forEach(item => {
    rows.push([item.code, item.name, item.amount]);
  });
  rows.push(["", "TOTAL ASET (AKTIVA)", bsData.totalAset]);
  rows.push([]);

  // B. PASIVA (KEWAJIBAN & EKUITAS)
  rows.push(["", "PASIVA (KEWAJIBAN & EKUITAS)", ""]);
  
  // Kewajiban
  rows.push(["", "KEWAJIBAN", ""]);
  const flatKewajiban = flattenNodesForCSV(bsData.kewajiban);
  flatKewajiban.forEach(item => {
    rows.push([item.code, item.name, item.amount]);
  });
  rows.push(["", "TOTAL KEWAJIBAN", bsData.totalKewajiban]);
  rows.push([]);

  // Ekuitas
  rows.push(["", "EKUITAS", ""]);
  rows.push(["", "  Modal Disetor (Awal / Tambahan)", ecData.modalAwal]);
  rows.push(["", "  Laba Bersih Berjalan", ecData.labaBersih]);
  rows.push(["", "  Penarikan Prive", -ecData.prive]);
  rows.push(["", "TOTAL EKUITAS", bsData.ekuitasAkhir]);
  rows.push([]);

  // Total Pasiva
  rows.push(["", "TOTAL PASIVA", bsData.totalPasiva]);
  rows.push([]);
  rows.push(["STATUS NERACA", bsData.isBalanced ? "SEIMBANG" : "TIDAK SEIMBANG", bsData.isBalanced ? "" : `Selisih: ${bsData.selisih}`]);

  return rowsToCSVString(rows);
}

// 3. Export Arus Kas (Cash Flow)
export function exportCashFlowToCSV(cfData: any, periodLabel = "Periode Berjalan") {
  const rows: (string | number | boolean | null | undefined)[][] = [
    ["LAPORAN ARUS KAS"],
    ["PRODEV - Housing Finance System"],
    [`Periode: ${periodLabel}`],
    ["Tanggal Unduh", new Date().toLocaleString("id-ID")],
    [],
    ["KODE AKUN", "KATEGORI / AKUN", "NOMINAL (IDR)"]
  ];

  // A. Operasional
  rows.push(["A", "ARUS KAS DARI OPERASIONAL", ""]);
  cfData.operasional.forEach((group: any) => {
    rows.push(["", `Group: ${group.label}`, ""]);
    group.items.forEach((item: any) => {
      rows.push([item.code, "  " + item.name, item.amount]);
    });
    rows.push(["", `Total ${group.label}`, group.total]);
  });
  rows.push(["", "TOTAL ARUS KAS DARI OPERASIONAL", cfData.totalOperasional]);
  rows.push([]);

  // B. Investasi
  rows.push(["B", "ARUS KAS DARI INVESTASI", ""]);
  cfData.investasi.forEach((group: any) => {
    rows.push(["", `Group: ${group.label}`, ""]);
    group.items.forEach((item: any) => {
      rows.push([item.code, "  " + item.name, item.amount]);
    });
    rows.push(["", `Total ${group.label}`, group.total]);
  });
  rows.push(["", "TOTAL ARUS KAS DARI INVESTASI", cfData.totalInvestasi]);
  rows.push([]);

  // C. Pendanaan
  rows.push(["C", "ARUS KAS DARI PENDANAAN", ""]);
  cfData.pendanaan.forEach((group: any) => {
    rows.push(["", `Group: ${group.label}`, ""]);
    group.items.forEach((item: any) => {
      rows.push([item.code, "  " + item.name, item.amount]);
    });
    rows.push(["", `Total ${group.label}`, group.total]);
  });
  rows.push(["", "TOTAL ARUS KAS DARI PENDANAAN", cfData.totalPendanaan]);
  rows.push([]);

  // Ringkasan
  rows.push([]);
  rows.push(["", "RINGKASAN SALDO KAS", ""]);
  rows.push(["", "KAS PADA SAAT AWAL PERIODE", cfData.kasAwalPeriode]);
  rows.push(["", "KENAIKAN / (PENURUNAN) KAS BERSIH", cfData.perubahanKasBersih]);
  rows.push(["", "KAS PADA SAAT AKHIR PERIODE", cfData.kasAkhirPeriode]);

  return rowsToCSVString(rows);
}

// 4. Export Perubahan Modal (Equity Change)
export function exportEquityChangeToCSV(ecData: any, modalAccounts: any[], priveAccounts: any[], balances: any, periodLabel = "Periode Berjalan") {
  const rows: (string | number | boolean | null | undefined)[][] = [
    ["LAPORAN PERUBAHAN MODAL"],
    ["PRODEV - Housing Finance System"],
    [`Periode: ${periodLabel}`],
    ["Tanggal Unduh", new Date().toLocaleString("id-ID")],
    [],
    ["KODE AKUN", "NAMA AKUN", "NOMINAL (IDR)"]
  ];

  rows.push(["", "Modal Disetor (Awal / Tambahan)", ecData.modalAwal]);
  modalAccounts.forEach((acc: any) => {
    rows.push([acc.code, "  " + acc.name, balances[acc.id] || 0]);
  });
  rows.push([]);

  rows.push(["", "Laba Bersih Periode Berjalan", ecData.labaBersih]);
  rows.push([]);

  if (ecData.prive > 0) {
    rows.push(["", "Penarikan Prive", -ecData.prive]);
    priveAccounts.forEach((acc: any) => {
      rows.push([acc.code, "  " + acc.name, balances[acc.id] || 0]);
    });
    rows.push([]);
  }

  rows.push(["", "Penambahan / (Pengurangan) Ekuitas Bersih", ecData.labaBersih - ecData.prive]);
  rows.push(["", "EKUITAS AKHIR (MODAL AKHIR)", ecData.ekuitasAkhir]);

  return rowsToCSVString(rows);
}
