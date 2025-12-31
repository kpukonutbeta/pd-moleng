import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  User,
  Plane,
  Calendar,
  Clock,
  Receipt,
} from 'lucide-react';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    fetchValidation();
  }, [id]);

  const fetchValidation = async () => {
    try {
      const res = await reportAPI.validate(id);
      setData(res.data);
    } catch (error) {
      toast.error('Gagal memuat data laporan');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (format) => {
    if (!data?.can_generate) {
      toast.error('Data belum lengkap untuk membuat laporan');
      return;
    }

    setGenerating(format);
    try {
      const res = await reportAPI.generate(id, format);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_perjalanan_${data.trip.judul.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh!`);
    } catch (error) {
      toast.error('Gagal membuat laporan');
    } finally {
      setGenerating(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-slate-500">Data tidak ditemukan</div>
      </MainLayout>
    );
  }

  const { trip, user, itineraries, expenses, total_expense, can_generate, profile_completed, trip_completed, has_itinerary, has_expense } = data;

  const CheckItem = ({ checked, label }) => (
    <div className="flex items-center gap-3 py-2">
      {checked ? (
        <CheckCircle className="w-5 h-5 text-emerald-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <span className={checked ? 'text-slate-700' : 'text-red-600'}>{label}</span>
    </div>
  );

  // Group itineraries by date
  const groupedItineraries = itineraries.reduce((acc, item) => {
    if (!acc[item.tanggal]) {
      acc[item.tanggal] = [];
    }
    acc[item.tanggal].push(item);
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate(`/trips/${id}`)}
          className="mb-6 text-slate-600 hover:text-slate-900"
          data-testid="back-to-detail-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Detail
        </Button>

        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
              Preview Laporan
            </h1>
            <p className="text-slate-600 mt-2">
              Tinjau dan unduh laporan perjalanan dinas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleGenerate('xlsx')}
              disabled={!can_generate || generating}
              data-testid="download-excel-btn"
            >
              {generating === 'xlsx' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Excel
            </Button>
            <Button
              onClick={() => handleGenerate('pdf')}
              disabled={!can_generate || generating}
              className="btn-primary"
              data-testid="download-pdf-btn"
            >
              {generating === 'pdf' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-24">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>
                  Kelengkapan Data
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <CheckItem checked={profile_completed} label="Profil pengguna lengkap" />
                <CheckItem checked={trip_completed} label="Data perjalanan lengkap" />
                <CheckItem checked={has_itinerary} label="Minimal 1 itinerary" />
                <CheckItem checked={has_expense} label="Minimal 1 biaya" />

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {can_generate ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Siap dibuat laporan</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Lengkapi data terlebih dahulu</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="a4-paper">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                  LAPORAN PERJALANAN DINAS
                </h1>
                <p className="text-sm text-slate-600">Nomor: -</p>
              </div>

              {/* User & Trip Info */}
              <div className="mb-8 space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Nama</span>
                  <span>:</span>
                  <span className="col-span-1">{user.full_name || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">NIP</span>
                  <span>:</span>
                  <span className="font-mono">{user.nip || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Jabatan</span>
                  <span>:</span>
                  <span>{user.jabatan || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Unit/Bagian</span>
                  <span>:</span>
                  <span>{user.unit || '-'}</span>
                </div>
                <div className="h-4"></div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Judul Perjalanan</span>
                  <span>:</span>
                  <span>{trip.judul}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Tujuan</span>
                  <span>:</span>
                  <span>{trip.tujuan}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Tanggal</span>
                  <span>:</span>
                  <span>{formatDate(trip.tanggal_mulai)} s.d. {formatDate(trip.tanggal_selesai)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Dasar Perjalanan</span>
                  <span>:</span>
                  <span>{trip.dasar_perjalanan}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Maksud dan Tujuan</span>
                  <span>:</span>
                  <span>{trip.maksud_tujuan}</span>
                </div>
              </div>

              {/* Itinerary Table */}
              <div className="mb-8">
                <h2 className="text-sm font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                  I. URAIAN KEGIATAN
                </h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left w-10">No</th>
                      <th className="border border-slate-300 p-2 text-left w-24">Tanggal</th>
                      <th className="border border-slate-300 p-2 text-left w-16">Waktu</th>
                      <th className="border border-slate-300 p-2 text-left">Kegiatan</th>
                      <th className="border border-slate-300 p-2 text-left w-28">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itineraries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="border border-slate-300 p-4 text-center text-slate-500">
                          Belum ada data itinerary
                        </td>
                      </tr>
                    ) : (
                      itineraries.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border border-slate-300 p-2">{index + 1}</td>
                          <td className="border border-slate-300 p-2">{item.tanggal}</td>
                          <td className="border border-slate-300 p-2">{item.waktu}</td>
                          <td className="border border-slate-300 p-2">{item.kegiatan}</td>
                          <td className="border border-slate-300 p-2">{item.lokasi}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Expense Table */}
              <div className="mb-8">
                <h2 className="text-sm font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                  II. RINCIAN BIAYA
                </h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left w-10">No</th>
                      <th className="border border-slate-300 p-2 text-left w-24">Tanggal</th>
                      <th className="border border-slate-300 p-2 text-left">Uraian</th>
                      <th className="border border-slate-300 p-2 text-right w-32">Jumlah (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="border border-slate-300 p-4 text-center text-slate-500">
                          Belum ada data biaya
                        </td>
                      </tr>
                    ) : (
                      <>
                        {expenses.map((item) => (
                          <tr key={item.id}>
                            <td className="border border-slate-300 p-2">{item.nomor}</td>
                            <td className="border border-slate-300 p-2">{item.tanggal}</td>
                            <td className="border border-slate-300 p-2">{item.uraian}</td>
                            <td className="border border-slate-300 p-2 text-right font-mono">
                              {formatRupiah(item.jumlah)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan="3" className="border border-slate-300 p-2 text-right">
                            TOTAL
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {formatRupiah(total_expense)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signature */}
              <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
                <div></div>
                <div className="text-center">
                  <p className="mb-1">__________, {new Date().toLocaleDateString('id-ID')}</p>
                  <p className="mb-16">Yang Membuat Laporan,</p>
                  <p className="font-semibold">({user.full_name || '________________'})</p>
                  <p>NIP. {user.nip || '________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
