import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Save, ArrowLeft, Plane } from 'lucide-react';

export default function TripCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    judul: '',
    tujuan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    dasar_perjalanan: '',
    maksud_tujuan: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.judul || !form.tujuan || !form.tanggal_mulai || !form.tanggal_selesai || !form.dasar_perjalanan || !form.maksud_tujuan) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (new Date(form.tanggal_selesai) < new Date(form.tanggal_mulai)) {
      toast.error('Tanggal selesai harus setelah tanggal mulai');
      return;
    }

    setLoading(true);
    try {
      const res = await tripsAPI.create(form);
      toast.success('Perjalanan berhasil dibuat!');
      navigate(`/trips/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal membuat perjalanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-slate-600 hover:text-slate-900"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
            Buat Perjalanan Baru
          </h1>
          <p className="text-slate-600 mt-2">
            Masukkan informasi dasar perjalanan dinas Anda
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>Informasi Perjalanan</CardTitle>
                <CardDescription>Detail yang akan tercantum di laporan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="judul" className="label-field">
                  Judul Perjalanan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="judul"
                  name="judul"
                  placeholder="Contoh: Kunjungan Kerja ke Kantor Wilayah Surabaya"
                  value={form.judul}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="trip-judul-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tujuan" className="label-field">
                  Tujuan / Destinasi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tujuan"
                  name="tujuan"
                  placeholder="Contoh: Surabaya, Jawa Timur"
                  value={form.tujuan}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="trip-tujuan-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal_mulai" className="label-field">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={handleChange}
                    className="input-field"
                    data-testid="trip-tanggal-mulai-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_selesai" className="label-field">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tanggal_selesai"
                    name="tanggal_selesai"
                    type="date"
                    value={form.tanggal_selesai}
                    onChange={handleChange}
                    className="input-field"
                    data-testid="trip-tanggal-selesai-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dasar_perjalanan" className="label-field">
                  Dasar Perjalanan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dasar_perjalanan"
                  name="dasar_perjalanan"
                  placeholder="Contoh: Surat Tugas No. 123/ST/2024"
                  value={form.dasar_perjalanan}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="trip-dasar-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maksud_tujuan" className="label-field">
                  Maksud dan Tujuan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="maksud_tujuan"
                  name="maksud_tujuan"
                  placeholder="Jelaskan maksud dan tujuan perjalanan dinas ini"
                  value={form.maksud_tujuan}
                  onChange={handleChange}
                  className="input-field min-h-[100px]"
                  data-testid="trip-maksud-input"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  data-testid="cancel-create-trip-btn"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  data-testid="submit-create-trip-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Perjalanan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
