import { ArrowLeft, Download, Printer } from 'lucide-react';
import Link from 'next/link';

export default function BalanceSheetPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Mock data laporan neraca
  const balanceSheetData = {
    companyName: 'PT. Perusahaan Anda',
    period: '31 Desember 2025',
    classification: 'Semua',
    aset: {
      lancar: {
        kas: 800224338.54,
        kasKecil: 554904337.64,
        pettyCash: 245320000.90,
        bank: 463165395.19,
        bankBCA: 209034840.00,
        bankBRI: 87165185.20,
        piutang: 1279209150.00,
        piutangUsaha: 1264419159.00,
        piutangKaryawan: 4790000.00,
        persediaan: 670327992.31,
        persiapanBarang: 670327992.31,
        pajak: 21849919.00,
      },
      tidakLancar: {
        asetTetap: 995278604.05,
        bangunan: 1000000000.00,
        kendaraan: 105550000.00,
        peralatanKantor: 16979200.00,
        akumulasiPenyusutan: -36492872.81,
        akumulasiKendaraan: -55760416.66,
        akumulasiPeralatan: -34797106.48,
        kitchenMachinery: 100000.00,
      },
    },
    kewajiban: {
      lancar: {
        utang: 2314649860.00,
        utangUsaha: 2314649860.00,
        utangPajak: 80381640.54,
        utangPPN: 79449954.54,
        utangPPh21: 803686.00,
        utangPPh23: 128000.00,
        biayaTerutang: 77352000.00,
        utangGajiUpah: 57570000.00,
        utangBPIS: -218000.00,
        utangDeposit: 20000000.00,
        utangLainnya: 1000000.00,
      },
      tidakLancar: {
        utangBank: 1500000000.00,
      },
    },
    ekuitas: {
      modal: 394160000.00,
      modalDisetor: 393460000.00,
      utangDireksi: 700000.00,
      saldoLaba: 1269601898.55,
      saldoLabaDitahan: 917297687.14,
      saldoLabaTahunBerjalan: 352304211.41,
    },
  };

  const totalAsetLancar = balanceSheetData.aset.lancar.kas + balanceSheetData.aset.lancar.bank + balanceSheetData.aset.lancar.piutang + balanceSheetData.aset.lancar.persediaan + balanceSheetData.aset.lancar.pajak;
  const totalAsetTidakLancar = balanceSheetData.aset.tidakLancar.asetTetap + balanceSheetData.aset.tidakLancar.kitchenMachinery;
  const totalAset = totalAsetLancar + totalAsetTidakLancar;

  const totalKewajibanLancar = balanceSheetData.kewajiban.lancar.utang + balanceSheetData.kewajiban.lancar.utangPajak + balanceSheetData.kewajiban.lancar.biayaTerutang + balanceSheetData.kewajiban.lancar.utangLainnya;
  const totalKewajibanTidakLancar = balanceSheetData.kewajiban.tidakLancar.utangBank;
  const totalKewajiban = totalKewajibanLancar + totalKewajibanTidakLancar;

  const totalEkuitas = balanceSheetData.ekuitas.modal + balanceSheetData.ekuitas.saldoLaba;
  const totalKewajibanEkuitas = totalKewajiban + totalEkuitas;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header dengan Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:bg-gray-100 p-2 rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-black">Laporan Neraca (Balance Sheet)</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-8 overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-black">{balanceSheetData.companyName}</h2>
          <h3 className="text-lg font-semibold text-black mt-2">Laporan Neraca (BS)</h3>
          <p className="text-sm text-black mt-2">Periode: 01 Januari 2025 s.d 31 Desember 2025</p>
          <p className="text-sm text-black">Klasifikasi: {balanceSheetData.classification}</p>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <tbody>
            {/* ASET SECTION */}
            <tr className="border-b-2 border-black">
              <td className="py-2 font-bold text-black">1.0.00 - ASET</td>
              <td className="text-right"></td>
            </tr>

            {/* ASET LANCAR */}
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-black pl-4">1.1.00 - ASET LANCAR</td>
              <td className="text-right"></td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.1.01 - Kas</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.kas)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.01.01 - Kas besar</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.kasKecil)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.01.02 - Petty Cash</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.pettyCash)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.1.02 - Bank</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.bank)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.02.01 - Bank BCA</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.bankBCA)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.02.02 - Bank BRI</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.bankBRI)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.1.03 - Piutang</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.aset.lancar.piutang)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.03.01 - Piutang Usaha</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.piutangUsaha)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.03.03 - Piutang Karyawan</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.piutangKaryawan)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.1.05 - Persediaan</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.aset.lancar.persediaan)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.1.05.01 - Persediaan Barang Dagang</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.lancar.persiapanBarang)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.1.07 - Pajak Dibayar Dimuka</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.aset.lancar.pajak)}</td>
            </tr>

            <tr className="border-t-2 border-black font-bold">
              <td className="py-2 text-black pl-4">Total Aset Lancar</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(totalAsetLancar)}</td>
            </tr>

            {/* ASET TIDAK LANCAR */}
            <tr className="bg-gray-50 mt-4">
              <td className="py-2 font-semibold text-black pl-4">1.2.00 - ASET TIDAK-LANCAR</td>
              <td className="text-right"></td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.2.01 - Aset Tetap</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.aset.tidakLancar.asetTetap)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.2.01.02 - Bangunan</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.tidakLancar.bangunan)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.2.01.03 - Kendaraan</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.tidakLancar.kendaraan)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">1.2.04 - KITCHEN MACHINERY</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.aset.tidakLancar.kitchenMachinery)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">1.2.04.01 - Freezer</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.aset.tidakLancar.kitchenMachinery)}</td>
            </tr>

            <tr className="border-t-2 border-black font-bold">
              <td className="py-2 text-black pl-4">TOTAL ASET</td>
              <td className="text-right text-black font-mono pr-4 text-lg">{formatCurrency(totalAset)}</td>
            </tr>

            {/* KEWAJIBAN SECTION */}
            <tr className="border-b-2 border-black mt-6">
              <td className="py-3 font-bold text-black">2.0.00 - KEWAJIBAN</td>
              <td className="text-right"></td>
            </tr>

            {/* KEWAJIBAN LANCAR */}
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-black pl-4">2.1.00 - KEWAJIBAN LANCAR</td>
              <td className="text-right"></td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">2.1.01 - Utang</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.kewajiban.lancar.utang)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">2.1.01.01 - Utang Usaha</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.kewajiban.lancar.utangUsaha)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">2.1.02 - Utang Pajak</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.kewajiban.lancar.utangPajak)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">2.1.02.01 - Utang PPN Keluaran</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.kewajiban.lancar.utangPPN)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">2.1.02.02 - Utang PPh 21</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.kewajiban.lancar.utangPPh21)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">2.1.03 - Biaya Terutang</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.kewajiban.lancar.biayaTerutang)}</td>
            </tr>

            <tr className="border-t border-black font-bold">
              <td className="py-2 text-black pl-4">Total Kewajiban Lancar</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(totalKewajibanLancar)}</td>
            </tr>

            {/* KEWAJIBAN TIDAK LANCAR */}
            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-black pl-4">2.2.00 - KEWAJIBAN TIDAK LANCAR</td>
              <td className="text-right"></td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">2.2.01 - Utang Bank</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.kewajiban.tidakLancar.utangBank)}</td>
            </tr>

            <tr className="border-t-2 border-black font-bold">
              <td className="py-2 text-black pl-4">TOTAL KEWAJIBAN</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(totalKewajiban)}</td>
            </tr>

            {/* EKUITAS SECTION */}
            <tr className="border-b-2 border-black">
              <td className="py-3 font-bold text-black">3.0.00 - EKUITAS</td>
              <td className="text-right"></td>
            </tr>

            <tr className="bg-gray-50">
              <td className="py-2 font-semibold text-black pl-4">3.1.00 - EKUITAS</td>
              <td className="text-right"></td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">3.1.01 - Modal</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.ekuitas.modal)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">3.1.01.01 - Modal Disetor</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.ekuitas.modalDisetor)}</td>
            </tr>

            <tr>
              <td className="py-1 text-black pl-8">3.1.02 - Saldo Laba</td>
              <td className="text-right text-black font-mono pr-4 font-semibold">{formatCurrency(balanceSheetData.ekuitas.saldoLaba)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">3.1.02.01 - Saldo Laba Ditahan</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.ekuitas.saldoLabaDitahan)}</td>
            </tr>
            <tr>
              <td className="py-1 text-black pl-12">3.1.02.02 - Saldo Laba Tahun Berjalan</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(balanceSheetData.ekuitas.saldoLabaTahunBerjalan)}</td>
            </tr>

            <tr className="border-t-2 border-black font-bold">
              <td className="py-2 text-black pl-4">TOTAL EKUITAS</td>
              <td className="text-right text-black font-mono pr-4">{formatCurrency(totalEkuitas)}</td>
            </tr>

            <tr className="border-t-4 border-black font-bold bg-gray-100">
              <td className="py-3 text-black pl-4 text-lg">TOTAL KEWAJIBAN DAN MODAL</td>
              <td className="text-right text-black font-mono pr-4 text-lg">{formatCurrency(totalKewajibanEkuitas)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-sm text-black">
          <p>Laporan per: <span className="font-semibold">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          <p className="mt-2 text-xs text-gray-600">Catatan: Laporan ini merupakan ringkasan keuangan perusahaan. Untuk detail lebih lanjut, silakan hubungi departemen keuangan.</p>
        </div>
      </div>
    </div>
  );
}
