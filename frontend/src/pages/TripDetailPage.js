import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI, itinerariesAPI, expensesAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Receipt,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import ItinerarySection from '../components/ItinerarySection';
import ExpenseSection from '../components/ExpenseSection';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tripRes, itinRes, expRes] = await Promise.all([
        tripsAPI.getOne(id),
        itinerariesAPI.getAll(id),
        expensesAPI.getAll(id),
      ]);
      setTrip(tripRes.data);
      setItineraries(itinRes.data);
      setExpenses(expRes.data);
    } catch (error) {
      toast.error('Gagal memuat data perjalanan');
      navigate('/dashboard');
    } finally {
      setLoading(false);
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

  const totalExpense = expenses.reduce((sum, e) => sum + e.jumlah, 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      </MainLayout>
    );
  }

  if (!trip) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-slate-500">Perjalanan tidak ditemukan</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-slate-600 hover:text-slate-900"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                {trip.judul}
              </h1>
              <Badge className={trip.status === 'completed' ? 'badge-completed' : 'badge-draft'}>
                {trip.status === 'completed' ? 'Selesai' : 'Draft'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {trip.tujuan}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.tanggal_mulai)} - {formatDate(trip.tanggal_selesai)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/trips/${id}/edit`)}
              data-testid="edit-trip-btn"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => navigate(`/trips/${id}/report`)}
              className="btn-primary"
              data-testid="generate-report-btn"
            >
              <FileText className="w-4 h-4 mr-2" />
              Buat Laporan
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white" data-testid="tab-overview">
              Ringkasan
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-white" data-testid="tab-itinerary">
              Itinerary ({itineraries.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-white" data-testid="tab-expenses">
              Biaya ({expenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Kegiatan</p>
                      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                        {itineraries.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Pengeluaran</p>
                      <p className="text-2xl font-bold text-slate-900 font-mono">
                        {formatRupiah(totalExpense)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Status Laporan</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {itineraries.length > 0 && expenses.length > 0 ? (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle className="w-5 h-5" />
                            Siap
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                            Belum Lengkap
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trip Details */}
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle style={{ fontFamily: 'Manrope' }}>Detail Perjalanan</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Judul Perjalanan</dt>
                    <dd className="mt-1 text-slate-900">{trip.judul}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Tujuan</dt>
                    <dd className="mt-1 text-slate-900">{trip.tujuan}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Tanggal</dt>
                    <dd className="mt-1 text-slate-900">
                      {formatDate(trip.tanggal_mulai)} s.d. {formatDate(trip.tanggal_selesai)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Dasar Perjalanan</dt>
                    <dd className="mt-1 text-slate-900">{trip.dasar_perjalanan}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-slate-500">Maksud dan Tujuan</dt>
                    <dd className="mt-1 text-slate-900">{trip.maksud_tujuan}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary">
            <ItinerarySection
              tripId={id}
              itineraries={itineraries}
              onUpdate={fetchData}
              startDate={trip.tanggal_mulai}
              endDate={trip.tanggal_selesai}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseSection
              tripId={id}
              expenses={expenses}
              onUpdate={fetchData}
              startDate={trip.tanggal_mulai}
              endDate={trip.tanggal_selesai}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
