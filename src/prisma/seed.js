import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const sources = {
    kemenkesTbc: 'https://tbindonesia.or.id/',
    permenkesTb: 'https://bphn.go.id/data/documents/16pmkes067.pdf',
    strategiTb: 'https://www.tbindonesia.or.id/wp-content/uploads/2021/06/NSP-TB-2020-2024-Ind_Final_-BAHASA.pdf',
    whoTb: 'https://www.who.int/health-topics/tuberculosis',
  };

  const educationData = [
    {
      title: 'Apa Itu Tuberkulosis (TBC)?',
      content: 'Tuberkulosis atau TBC adalah penyakit menular yang disebabkan oleh bakteri Mycobacterium tuberculosis. Penyakit ini paling sering menyerang paru-paru, tetapi juga dapat menyerang bagian tubuh lain. TBC dapat dicegah, ditemukan melalui pemeriksaan kesehatan, dan diobati dengan obat anti tuberkulosis sesuai arahan tenaga kesehatan.',
      category: 'Mengenal TBC',
      sumber: sources.kemenkesTbc,
      order: 1,
    },
    {
      title: 'Cara Penularan TBC',
      content: 'TBC menyebar melalui udara ketika orang dengan TBC paru atau TBC saluran napas yang infeksius batuk, bersin, berbicara, atau mengeluarkan percikan dari saluran napas. TBC tidak menular melalui berjabat tangan, berbagi makanan, atau memakai alat makan yang sama.',
      category: 'Mengenal TBC',
      sumber: sources.whoTb,
      order: 2,
    },
    {
      title: 'Gejala yang Perlu Diwaspadai',
      content: 'Gejala TBC paru yang perlu diwaspadai antara lain batuk yang berlangsung lama, batuk berdahak atau batuk darah, demam, berkeringat pada malam hari, berat badan turun, nafsu makan berkurang, nyeri dada, dan tubuh terasa lemah. Jika keluhan menetap atau ada riwayat kontak erat dengan pasien TBC, segera periksa ke fasilitas kesehatan.',
      category: 'Gejala & Deteksi',
      sumber: sources.kemenkesTbc,
      order: 1,
    },
    {
      title: 'Pemeriksaan untuk Menemukan TBC',
      content: 'Pemeriksaan TBC dilakukan oleh tenaga kesehatan berdasarkan gejala, riwayat kontak, dan pemeriksaan penunjang. Pemeriksaan dapat mencakup pemeriksaan dahak, tes cepat molekuler, rontgen dada, atau pemeriksaan lain sesuai kondisi pasien.',
      category: 'Gejala & Deteksi',
      sumber: sources.strategiTb,
      order: 2,
    },
    {
      title: 'Pencegahan Penularan TBC di Rumah',
      content: 'Pencegahan TBC dilakukan dengan mengurangi risiko penularan dan memastikan pasien mendapat pengobatan yang tepat. Rumah perlu memiliki ventilasi baik, cahaya matahari yang cukup, dan kebiasaan hidup bersih. Pasien yang sedang batuk perlu menerapkan etika batuk, memakai masker sesuai anjuran, dan tidak membuang dahak sembarangan.',
      category: 'Pencegahan',
      sumber: sources.permenkesTb,
      order: 1,
    },
    {
      title: 'Terapi Pencegahan TBC',
      content: 'Terapi Pencegahan Tuberkulosis atau TPT dapat diberikan kepada kelompok tertentu yang berisiko, sesuai hasil penilaian tenaga kesehatan. Tujuannya adalah menurunkan risiko berkembangnya penyakit TBC aktif. TPT tidak boleh dimulai sendiri dan harus melalui fasilitas pelayanan kesehatan.',
      category: 'Pencegahan',
      sumber: sources.strategiTb,
      order: 2,
    },
    {
      title: 'Etika Batuk yang Benar',
      content: 'Etika batuk membantu mengurangi penyebaran percikan dari saluran napas. Saat batuk atau bersin, tutup hidung dan mulut menggunakan tisu, sapu tangan, atau lengan bagian dalam. Buang tisu bekas ke tempat sampah dan bersihkan tangan setelah batuk atau bersin.',
      category: 'Etika Batuk',
      sumber: sources.permenkesTb,
      order: 1,
    },
    {
      title: 'Jangan Meludah Sembarangan',
      content: 'Dahak pasien TBC dapat mengandung kuman. Karena itu, dahak tidak boleh dibuang sembarangan di tempat umum atau lingkungan rumah. Bila perlu membuang dahak, ikuti arahan tenaga kesehatan atau gunakan tempat yang aman dan tertutup.',
      category: 'Etika Batuk',
      sumber: sources.permenkesTb,
      order: 2,
    },
    {
      title: 'Pengobatan TBC dengan OAT',
      content: 'TBC dapat diobati dengan Obat Anti Tuberkulosis atau OAT. Obat harus diminum sesuai jenis, dosis, jadwal, dan lama pengobatan yang ditentukan oleh tenaga kesehatan. Pasien tidak boleh menghentikan obat sendiri walaupun gejala sudah membaik.',
      category: 'Obat-obatan OAT',
      sumber: sources.strategiTb,
      order: 1,
    },
    {
      title: 'Pentingnya Minum Obat Sampai Tuntas',
      content: 'Kepatuhan minum obat adalah kunci keberhasilan pengobatan TBC. Pengobatan yang tidak teratur dapat menyebabkan penyakit tidak sembuh dan meningkatkan risiko TBC resistan obat. Jika mengalami keluhan setelah minum obat, segera hubungi tenaga kesehatan.',
      category: 'Obat-obatan OAT',
      sumber: sources.strategiTb,
      order: 2,
    },
    {
      title: 'Gizi Seimbang Selama Pengobatan TBC',
      content: 'Asupan gizi yang cukup membantu tubuh menjalani proses pemulihan selama pengobatan TBC. Konsumsi makanan beragam dengan sumber karbohidrat, lauk berprotein, sayur, buah, dan cairan yang cukup sesuai kebutuhan. Nutrisi bukan pengganti OAT.',
      category: 'Nutrisi',
      sumber: sources.kemenkesTbc,
      order: 1,
    },
    {
      title: 'Dukungan Keluarga untuk Makan dan Minum Obat',
      content: 'Keluarga dapat membantu pasien dengan menyediakan makanan bergizi, mengingatkan jadwal minum obat, dan mendampingi kontrol ke fasilitas kesehatan. Jika pasien sulit makan, berat badan menurun, atau memiliki penyakit lain seperti diabetes, konsultasikan pola makan dengan tenaga kesehatan.',
      category: 'Nutrisi',
      sumber: sources.kemenkesTbc,
      order: 2,
    },
  ];

  await prisma.educationContent.deleteMany();

  for (const data of educationData) {
    await prisma.educationContent.create({ data });
  }

  console.log('Seed completed: education data replaced with sourced content.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
