/**
 * Verifikasi Kesinambungan Antar Laporan
 * Jalankan: npx tsx src/lib/verify-reports.ts
 */
import { defaultAccounts, defaultTransactions, buildReports, formatIDR } from './accounting';

const r = buildReports(defaultAccounts, defaultTransactions);

console.log('══════════════════════════════════════════════════');
console.log('  VERIFIKASI KESINAMBUNGAN ANTAR LAPORAN');
console.log('══════════════════════════════════════════════════\n');

// 1) Laba Rugi
console.log('1. LAPORAN LABA RUGI');
console.log('   Pendapatan :', formatIDR(r.incomeStatement.totalPendapatan));
console.log('   Beban      :', formatIDR(r.incomeStatement.totalBeban));
console.log('   Laba Bersih:', formatIDR(r.incomeStatement.labaBersih));

// 2) Perubahan Modal
console.log('\n2. LAPORAN PERUBAHAN MODAL');
console.log('   Modal Awal   :', formatIDR(r.equityChange.modalAwal));
console.log('   + Laba Bersih:', formatIDR(r.equityChange.labaBersih));
console.log('   - Prive      :', formatIDR(r.equityChange.prive));
console.log('   = Ekuitas Akhir:', formatIDR(r.equityChange.ekuitasAkhir));

// 3) Neraca
console.log('\n3. LAPORAN NERACA');
console.log('   Total Aset     :', formatIDR(r.balanceSheet.totalAset));
console.log('   Total Kewajiban:', formatIDR(r.balanceSheet.totalKewajiban));
console.log('   Ekuitas Akhir  :', formatIDR(r.balanceSheet.ekuitasAkhir));
console.log('   Total Pasiva   :', formatIDR(r.balanceSheet.totalPasiva));
console.log('   Balanced?      :', r.balanceSheet.isBalanced ? '✅ YA' : '❌ TIDAK');

// 4) Arus Kas
console.log('\n4. LAPORAN ARUS KAS');
console.log('   Operasional:', formatIDR(r.cashFlowReport.totalOperasional));
console.log('   Investasi  :', formatIDR(r.cashFlowReport.totalInvestasi));
console.log('   Pendanaan  :', formatIDR(r.cashFlowReport.totalPendanaan));
console.log('   Kas Akhir  :', formatIDR(r.cashFlowReport.kasAkhirPeriode));

// 5) Cross-check
const cashAccounts = defaultAccounts.filter(a => a.isCash && !a.parentId);
const totalKasFromBalances = cashAccounts.reduce((s, a) => s + (r.balances[a.id] || 0), 0);

console.log('\n══════════════════════════════════════════════════');
console.log('  CROSS-CHECK KESINAMBUNGAN');
console.log('══════════════════════════════════════════════════');

// Check 1: Laba Rugi → Perubahan Modal
const check1 = r.incomeStatement.labaBersih === r.equityChange.labaBersih;
console.log(`\n[${check1 ? '✅' : '❌'}] Laba Bersih (Laba Rugi) === Laba Bersih (Perubahan Modal)`);
console.log(`    ${formatIDR(r.incomeStatement.labaBersih)} === ${formatIDR(r.equityChange.labaBersih)}`);

// Check 2: Ekuitas (Perubahan Modal) → Neraca
const check2 = r.equityChange.ekuitasAkhir === r.balanceSheet.ekuitasAkhir;
console.log(`[${check2 ? '✅' : '❌'}] Ekuitas Akhir (Perubahan Modal) === Ekuitas (Neraca)`);
console.log(`    ${formatIDR(r.equityChange.ekuitasAkhir)} === ${formatIDR(r.balanceSheet.ekuitasAkhir)}`);

// Check 3: Aset = Kewajiban + Ekuitas (Neraca Balance)
const check3 = r.balanceSheet.isBalanced;
console.log(`[${check3 ? '✅' : '❌'}] Aset === Kewajiban + Ekuitas (Neraca Seimbang)`);
console.log(`    ${formatIDR(r.balanceSheet.totalAset)} === ${formatIDR(r.balanceSheet.totalPasiva)}`);

// Check 4: Kas Akhir (Arus Kas) === Total Saldo Kas di Neraca
const check4 = Math.abs(r.cashFlowReport.kasAkhirPeriode - totalKasFromBalances) < 1;
console.log(`[${check4 ? '✅' : '❌'}] Kas Akhir (Arus Kas) === Total Saldo Kas/Bank (Neraca)`);
console.log(`    ${formatIDR(r.cashFlowReport.kasAkhirPeriode)} === ${formatIDR(totalKasFromBalances)}`);

const allPassed = check1 && check2 && check3 && check4;
console.log(`\n══════════════════════════════════════════════════`);
console.log(`  HASIL: ${allPassed ? '✅ SEMUA LAPORAN SALING BERKESINAMBUNGAN' : '❌ ADA KETIDAKSESUAIAN'}`);
console.log(`══════════════════════════════════════════════════\n`);
