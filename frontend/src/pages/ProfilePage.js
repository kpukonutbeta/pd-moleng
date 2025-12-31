import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    nip: '',
    jabatan: '',
    unit: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        nip: user.nip || '',
        jabatan: user.jabatan || '',
        unit: user.unit || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.nip || !form.jabatan || !form.unit) {
      toast.error('Semua field harus diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data);
      toast.success('Profil berhasil disimpan!');
      if (res.data.profile_completed) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = form.full_name && form.nip && form.jabatan && form.unit;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
            Profil Pengguna
          </h1>
          <p className="text-slate-600 mt-2">
            Lengkapi data diri Anda untuk dapat membuat laporan perjalanan dinas
          </p>
        </div>

        {!isComplete && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Profil Belum Lengkap</p>
              <p className="text-amber-700 text-sm">
                Lengkapi semua data untuk dapat membuat laporan perjalanan dinas.
              </p>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-800 font-medium">Profil Lengkap</p>
              <p className="text-emerald-700 text-sm">
                Anda dapat membuat dan mengelola laporan perjalanan dinas.
              </p>
            </div>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <CardTitle className="text-lg" style={{ fontFamily: 'Manrope' }}>Data Identitas</CardTitle>
                <CardDescription>Informasi yang akan tercantum di laporan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="label-field">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Masukkan nama lengkap"
                  value={form.full_name}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="profile-fullname-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip" className="label-field">
                  NIP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nip"
                  name="nip"
                  placeholder="Masukkan NIP"
                  value={form.nip}
                  onChange={handleChange}
                  className="input-field font-mono"
                  data-testid="profile-nip-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan" className="label-field">
                  Jabatan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jabatan"
                  name="jabatan"
                  placeholder="Masukkan jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="profile-jabatan-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="label-field">
                  Unit / Bagian <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit"
                  name="unit"
                  placeholder="Masukkan unit atau bagian"
                  value={form.unit}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="profile-unit-input"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  data-testid="profile-save-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
