import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Plane, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }
    
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Login berhasil!');
      if (!data.user.profile_completed) {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 login-bg relative">
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-heading">TravelLog</span>
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
              Sistem Laporan Perjalanan Dinas
            </h1>
            <p className="text-lg text-slate-300">
              Kelola perjalanan dinas Anda dengan mudah dan buat laporan resmi secara otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>TravelLog</span>
          </div>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl" style={{ fontFamily: 'Manrope' }}>Masuk</CardTitle>
              <CardDescription>
                Masukkan email dan password untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="label-field">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="label-field">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-emerald-700 hover:underline font-medium" data-testid="register-link">
                  Daftar sekarang
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
