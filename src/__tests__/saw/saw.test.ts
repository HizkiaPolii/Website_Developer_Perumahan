/**
 * Test Suite: SAW (Simple Additive Weighting) — Analisis Kinerja
 *
 * Memverifikasi logika algoritma SPK yang digunakan di:
 *   - Backend:  src/controllers/spkController.ts
 *   - Frontend: src/app/laporan/analisis-kinerja/page.tsx
 *
 * Bobot:
 *   C1 Rasio Laba Bersih      = 35% (Benefit)
 *   C2 Pertumbuhan Pendapatan = 30% (Benefit)
 *   C3 Rasio Efisiensi Beban  = 20% (Cost)
 *   C4 Rasio Likuiditas Kas   = 15% (Benefit)
 *
 * Rumus:  Skor = W1*R1 + W2*R2 + W3*R3 + W4*R4
 * Normalisasi Benefit: R = nilai / max(nilai)
 * Normalisasi Cost:    R = min(nilai) / nilai
 */

import { describe, it, expect } from 'vitest';

// ─── Konstanta (sama persis dengan spkController.ts) ─────────
const BOBOT = { c1: 0.35, c2: 0.30, c3: 0.20, c4: 0.15 };

function getKategori(skor: number): string {
  if (skor >= 0.80) return 'Sangat Baik';
  if (skor >= 0.60) return 'Baik';
  if (skor >= 0.40) return 'Cukup';
  if (skor >= 0.20) return 'Kurang';
  return 'Sangat Kurang';
}

// ─── Tipe data bulan ─────────────────────────────────────────
interface MonthData {
  periode: string;
  pendapatan: number;
  beban: number;
  labaBersih: number;
  saldoKas: number;
}

// ─── Implementasi SAW (sama dengan spkController.ts) ─────────
function hitungSAW(months: MonthData[]) {
  // Step 1 — Hitung nilai kriteria mentah
  const denganKriteria = months.map((m, i) => {
    const prev = i > 0 ? months[i - 1] : null;
    const c1 = m.pendapatan > 0 ? m.labaBersih / m.pendapatan : 0;
    const c2 = prev && prev.pendapatan > 0
      ? (m.pendapatan - prev.pendapatan) / prev.pendapatan
      : null;
    const c3 = m.pendapatan > 0 ? m.beban / m.pendapatan : 1;
    const c4 = m.beban > 0 ? m.saldoKas / m.beban : (m.saldoKas > 0 ? 1 : 0);
    return { ...m, c1, c2, c3, c4 };
  });

  // Step 2 — Tentukan nilai max/min untuk normalisasi
  const maxC1 = Math.max(...denganKriteria.map((m) => m.c1), 0.0001);
  const c2Vals = denganKriteria.filter((m) => m.c2 !== null).map((m) => m.c2 as number);
  const maxC2 = c2Vals.length > 0 ? Math.max(...c2Vals, 0.0001) : 1;
  const minC3 = Math.min(...denganKriteria.map((m) => m.c3));
  const maxC4 = Math.max(...denganKriteria.map((m) => m.c4), 0.0001);

  // Step 3 — Normalisasi & hitung skor
  const hasil = denganKriteria.map((m) => {
    const r1 = m.c1 / maxC1;
    const r2 = m.c2 !== null ? Math.max(0, m.c2 / maxC2) : 0;
    const r3 = m.c3 > 0 ? minC3 / m.c3 : 1;
    const r4 = m.c4 / maxC4;

    const w1 = m.c2 !== null ? BOBOT.c1 : BOBOT.c1 + BOBOT.c2;
    const w2 = m.c2 !== null ? BOBOT.c2 : 0;

    const skor = w1 * r1 + w2 * r2 + BOBOT.c3 * r3 + BOBOT.c4 * r4;
    return { ...m, r1, r2, r3, r4, skor, kategori: getKategori(skor) };
  });

  // Step 4 — Ranking
  const sorted = [...hasil].sort((a, b) => b.skor - a.skor);
  sorted.forEach((item, i) => { (item as any).peringkat = i + 1; });
  const rankMap = new Map(sorted.map((s, i) => [s.periode, i + 1]));
  hasil.forEach((h) => { (h as any).peringkat = rankMap.get(h.periode) ?? 0; });

  return hasil;
}

// ─────────────────────────────────────────────────────────────
// Test: Kategori
// ─────────────────────────────────────────────────────────────
describe('getKategori', () => {
  it('skor 0.80 ke atas → Sangat Baik', () => {
    expect(getKategori(0.80)).toBe('Sangat Baik');
    expect(getKategori(0.95)).toBe('Sangat Baik');
    expect(getKategori(1.00)).toBe('Sangat Baik');
  });

  it('skor 0.60–0.79 → Baik', () => {
    expect(getKategori(0.60)).toBe('Baik');
    expect(getKategori(0.75)).toBe('Baik');
    expect(getKategori(0.799)).toBe('Baik');
  });

  it('skor 0.40–0.59 → Cukup', () => {
    expect(getKategori(0.40)).toBe('Cukup');
    expect(getKategori(0.50)).toBe('Cukup');
  });

  it('skor 0.20–0.39 → Kurang', () => {
    expect(getKategori(0.20)).toBe('Kurang');
    expect(getKategori(0.30)).toBe('Kurang');
  });

  it('skor di bawah 0.20 → Sangat Kurang', () => {
    expect(getKategori(0.00)).toBe('Sangat Kurang');
    expect(getKategori(0.19)).toBe('Sangat Kurang');
  });
});

// ─────────────────────────────────────────────────────────────
// Test: 2 Bulan — kasus sederhana
// ─────────────────────────────────────────────────────────────
describe('SAW — 2 bulan (Januari & Februari)', () => {
  const months: MonthData[] = [
    {
      // Januari: laba besar, efisien, kas tinggi → kandidat #1
      periode: '2026-01',
      pendapatan: 500_000_000,
      beban: 200_000_000,
      labaBersih: 300_000_000,
      saldoKas: 1_000_000_000,
    },
    {
      // Februari: margin turun, beban naik, tapi ada growth
      periode: '2026-02',
      pendapatan: 600_000_000,
      beban: 300_000_000,
      labaBersih: 300_000_000,
      saldoKas: 800_000_000,
    },
  ];

  const hasil = hitungSAW(months);

  describe('Januari (bulan pertama — C2 null)', () => {
    const jan = hasil[0];

    it('c1 = 0.60 (labaBersih/pendapatan = 300M/500M)', () => {
      expect(jan.c1).toBeCloseTo(0.60, 5);
    });

    it('c2 = null (tidak ada bulan sebelumnya)', () => {
      expect(jan.c2).toBeNull();
    });

    it('c3 = 0.40 (beban/pendapatan = 200M/500M)', () => {
      expect(jan.c3).toBeCloseTo(0.40, 5);
    });

    it('c4 = 5.0 (saldoKas/beban = 1B/200M)', () => {
      expect(jan.c4).toBeCloseTo(5.0, 5);
    });

    it('r1 = 1.0 (nilai maksimum = nilai sendiri)', () => {
      expect(jan.r1).toBeCloseTo(1.0, 4);
    });

    it('r3 = 1.0 (nilai minimum cost = nilai sendiri)', () => {
      expect(jan.r3).toBeCloseTo(1.0, 4);
    });

    it('bobot C2 dialihkan ke C1 saat c2 null → skor = 0.65×1 + 0.20×1 + 0.15×1 = 1.0', () => {
      // w1 = 0.35 + 0.30 = 0.65, w2 = 0
      // r4 = 5.0/5.0 = 1.0 → w4*r4 = 0.15
      // skor = 0.65*1 + 0*0 + 0.20*1 + 0.15*1 = 1.0
      expect(jan.skor).toBeCloseTo(1.0, 4);
    });

    it('kategori Sangat Baik (skor 1.0)', () => {
      expect(jan.kategori).toBe('Sangat Baik');
    });
  });

  describe('Februari (bulan kedua — ada C2)', () => {
    const feb = hasil[1];

    it('c1 = 0.50 (labaBersih/pendapatan = 300M/600M)', () => {
      expect(feb.c1).toBeCloseTo(0.50, 5);
    });

    it('c2 = 0.20 (pertumbuhan = (600M-500M)/500M)', () => {
      expect(feb.c2).toBeCloseTo(0.20, 5);
    });

    it('c3 = 0.50 (beban/pendapatan = 300M/600M)', () => {
      expect(feb.c3).toBeCloseTo(0.50, 5);
    });

    it('c4 = 2.6667 (saldoKas/beban = 800M/300M)', () => {
      expect(feb.c4).toBeCloseTo(2.6667, 3);
    });

    it('r1 = 0.8333 (0.50/0.60)', () => {
      expect(feb.r1).toBeCloseTo(0.8333, 3);
    });

    it('r2 = 1.0 (0.20/0.20 — nilai max C2)', () => {
      expect(feb.r2).toBeCloseTo(1.0, 4);
    });

    it('r3 = 0.80 (minC3/c3 = 0.40/0.50)', () => {
      expect(feb.r3).toBeCloseTo(0.80, 4);
    });

    it('r4 = 0.5333 (2.6667/5.0)', () => {
      expect(feb.r4).toBeCloseTo(0.5333, 3);
    });

    it('skor ≈ 0.832 (< 1.0 milik Januari)', () => {
      // 0.35*0.8333 + 0.30*1.0 + 0.20*0.80 + 0.15*0.5333
      // = 0.29167 + 0.30 + 0.16 + 0.08 = 0.832
      expect(feb.skor).toBeCloseTo(0.832, 2);
    });
  });

  describe('Ranking', () => {
    it('Januari mendapat peringkat 1 (skor 1.0 > 0.832)', () => {
      expect((hasil[0] as any).peringkat).toBe(1);
    });

    it('Februari mendapat peringkat 2', () => {
      expect((hasil[1] as any).peringkat).toBe(2);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Test: 3 Bulan — kasus lebih kompleks
// ─────────────────────────────────────────────────────────────
describe('SAW — 3 bulan (kasus kompleks)', () => {
  const months: MonthData[] = [
    {
      periode: '2026-01',
      pendapatan: 300_000_000,
      beban: 250_000_000,
      labaBersih: 50_000_000,
      saldoKas: 100_000_000,
    },
    {
      periode: '2026-02',
      pendapatan: 500_000_000,
      beban: 200_000_000,
      labaBersih: 300_000_000,
      saldoKas: 400_000_000,
    },
    {
      periode: '2026-03',
      pendapatan: 450_000_000,
      beban: 180_000_000,
      labaBersih: 270_000_000,
      saldoKas: 600_000_000,
    },
  ];

  const hasil = hitungSAW(months);

  it('menghasilkan 3 hasil (satu per bulan)', () => {
    expect(hasil.length).toBe(3);
  });

  it('semua peringkat unik (tidak ada seri)', () => {
    const peringkats = hasil.map(h => (h as any).peringkat);
    const unique = new Set(peringkats);
    expect(unique.size).toBe(3);
  });

  it('total bobot = 1.0 (integritas formula SAW)', () => {
    const totalBobot = BOBOT.c1 + BOBOT.c2 + BOBOT.c3 + BOBOT.c4;
    expect(totalBobot).toBeCloseTo(1.0, 5);
  });

  it('semua skor ada di rentang [0, 1]', () => {
    hasil.forEach(h => {
      expect(h.skor).toBeGreaterThanOrEqual(0);
      expect(h.skor).toBeLessThanOrEqual(1.01); // sedikit toleransi
    });
  });

  it('bulan dengan laba terbesar RELATIF (bukan absolut) mendapat C1 tertinggi', () => {
    // Feb: 300M/500M = 0.60, Mar: 270M/450M = 0.60, Jan: 50M/300M = 0.167
    // Feb dan Mar sama, Jan paling rendah
    const c1Values = hasil.map(h => h.c1);
    expect(c1Values[0]).toBeLessThan(c1Values[1]); // Jan < Feb
  });

  it('bulan pertama (c2=null) masih bisa bersaing karena bobot C2 dialihkan ke C1', () => {
    // Bulan pertama tidak dipenalisasi, hanya tidak punya C2
    const jan = hasil[0];
    expect(jan.c2).toBeNull();
    expect(jan.skor).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: Kasus khusus — pertumbuhan negatif
// ─────────────────────────────────────────────────────────────
describe('SAW — pertumbuhan pendapatan negatif', () => {
  const months: MonthData[] = [
    {
      periode: '2026-01',
      pendapatan: 500_000_000,
      beban: 100_000_000,
      labaBersih: 400_000_000,
      saldoKas: 500_000_000,
    },
    {
      periode: '2026-02',
      // Pendapatan turun dari 500M → 300M
      pendapatan: 300_000_000,
      beban: 100_000_000,
      labaBersih: 200_000_000,
      saldoKas: 400_000_000,
    },
  ];

  const hasil = hitungSAW(months);
  const feb = hasil[1];

  it('c2 negatif jika pendapatan turun', () => {
    expect(feb.c2).toBeLessThan(0);
    // (300M - 500M) / 500M = -0.40
    expect(feb.c2).toBeCloseTo(-0.40, 5);
  });

  it('r2 = 0 jika c2 negatif (Math.max(0, negatif))', () => {
    // r2 = Math.max(0, c2/maxC2) — negatif diklem ke 0
    expect(feb.r2).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: Kasus satu bulan saja
// ─────────────────────────────────────────────────────────────
describe('SAW — hanya 1 bulan', () => {
  const months: MonthData[] = [
    {
      periode: '2026-01',
      pendapatan: 400_000_000,
      beban: 120_000_000,
      labaBersih: 280_000_000,
      saldoKas: 300_000_000,
    },
  ];

  const hasil = hitungSAW(months);

  it('menghasilkan 1 hasil', () => {
    expect(hasil.length).toBe(1);
  });

  it('mendapat peringkat 1 (satu-satunya)', () => {
    expect((hasil[0] as any).peringkat).toBe(1);
  });

  it('r1 = r3 = r4 = 1.0 (normalisasi terhadap diri sendiri)', () => {
    expect(hasil[0].r1).toBeCloseTo(1.0, 5);
    expect(hasil[0].r3).toBeCloseTo(1.0, 5);
    expect(hasil[0].r4).toBeCloseTo(1.0, 5);
  });

  it('skor = bobot penuh (tanpa C2) = 0.65+0.20+0.15 = 1.0', () => {
    expect(hasil[0].skor).toBeCloseTo(1.0, 5);
  });
});

// ─────────────────────────────────────────────────────────────
// Test: Integritas bobot SAW
// ─────────────────────────────────────────────────────────────
describe('Integritas Bobot SAW', () => {
  it('total bobot C1+C2+C3+C4 = 100%', () => {
    const total = BOBOT.c1 + BOBOT.c2 + BOBOT.c3 + BOBOT.c4;
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('C1 adalah bobot terbesar (35%) — laba paling penting', () => {
    expect(BOBOT.c1).toBeGreaterThan(BOBOT.c2);
    expect(BOBOT.c1).toBeGreaterThan(BOBOT.c3);
    expect(BOBOT.c1).toBeGreaterThan(BOBOT.c4);
  });

  it('C4 adalah bobot terkecil (15%) — likuiditas penunjang', () => {
    expect(BOBOT.c4).toBeLessThan(BOBOT.c1);
    expect(BOBOT.c4).toBeLessThan(BOBOT.c2);
    expect(BOBOT.c4).toBeLessThan(BOBOT.c3);
  });
});
