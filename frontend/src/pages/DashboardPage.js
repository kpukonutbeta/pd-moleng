import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Calendar, MapPin, FileText, Plane, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripsAPI.getAll();
      setTrips(res.data);
    } catch (error) {
      toast.error('Gagal memuat data perjalanan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await tripsAPI.delete(deleteId);
      toast.success('Perjalanan berhasil dihapus');
      fetchTrips();
    } catch (error) {
      toast.error('Gagal menghapus perjalanan');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const draftCount = trips.filter(t => t.status === 'draft').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
              Daftar Perjalanan Dinas
            </h1>
            <p className="text-slate-600 mt-2">
              Kelola semua perjalanan dinas Anda
            </p>
          </div>
          <Button
            onClick={() => navigate('/trips/new')}
            className="btn-primary"
            data-testid="create-trip-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Perjalanan Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Perjalanan</p>
                  <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                    {trips.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Draft</p>
                  <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                    {draftCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Selesai</p>
                  <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                    {completedCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat data...</div>
        ) : trips.length === 0 ? (
          <Card className="border-slate-200 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>
                Belum Ada Perjalanan
              </h3>
              <p className="text-slate-500 mb-6">
                Buat perjalanan dinas pertama Anda untuk mulai mengelola laporan
              </p>
              <Button
                onClick={() => navigate('/trips/new')}
                className="btn-primary"
                data-testid="create-first-trip-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Perjalanan Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <Card
                key={trip.id}
                className="card-hover cursor-pointer group"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/trips/${trip.id}`)}
                data-testid={`trip-card-${trip.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 truncate" style={{ fontFamily: 'Manrope' }}>
                          {trip.judul}
                        </h3>
                        <Badge className={trip.status === 'completed' ? 'badge-completed' : 'badge-draft'}>
                          {trip.status === 'completed' ? 'Selesai' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {trip.tujuan}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.tanggal_mulai)} - {formatDate(trip.tanggal_selesai)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                        {trip.maksud_tujuan}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.id}/edit`);
                        }}
                        data-testid={`edit-trip-btn-${trip.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(trip.id);
                        }}
                        data-testid={`delete-trip-btn-${trip.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>Hapus Perjalanan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus perjalanan ini? Semua data itinerary dan biaya yang terkait juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} data-testid="cancel-delete-btn">
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-testid="confirm-delete-btn"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
