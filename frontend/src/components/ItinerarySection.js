import { useState } from 'react';
import { itinerariesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Clock, MapPin, Calendar, FileText } from 'lucide-react';

export default function ItinerarySection({ tripId, itineraries, onUpdate, startDate, endDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal: '',
    waktu: '',
    kegiatan: '',
    lokasi: '',
    catatan: '',
  });

  const resetForm = () => {
    setForm({
      tanggal: startDate || '',
      waktu: '',
      kegiatan: '',
      lokasi: '',
      catatan: '',
    });
    setEditingId(null);
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setForm({
        tanggal: item.tanggal,
        waktu: item.waktu,
        kegiatan: item.kegiatan,
        lokasi: item.lokasi,
        catatan: item.catatan || '',
      });
      setEditingId(item.id);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.waktu || !form.kegiatan || !form.lokasi) {
      toast.error('Tanggal, waktu, kegiatan, dan lokasi harus diisi');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await itinerariesAPI.update(tripId, editingId, form);
        toast.success('Itinerary berhasil diperbarui');
      } else {
        await itinerariesAPI.create(tripId, form);
        toast.success('Itinerary berhasil ditambahkan');
      }
      handleCloseForm();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await itinerariesAPI.delete(tripId, deleteId);
      toast.success('Itinerary berhasil dihapus');
      onUpdate();
    } catch (error) {
      toast.error('Gagal menghapus itinerary');
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  // Group by date
  const groupedByDate = itineraries.reduce((acc, item) => {
    if (!acc[item.tanggal]) {
      acc[item.tanggal] = [];
    }
    acc[item.tanggal].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
            Itinerary Perjalanan
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Catat semua kegiatan selama perjalanan dinas
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="btn-primary" data-testid="add-itinerary-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      {itineraries.length === 0 ? (
        <Card className="border-slate-200 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>
              Belum Ada Itinerary
            </h3>
            <p className="text-slate-500 mb-4">
              Tambahkan kegiatan harian Anda
            </p>
            <Button onClick={() => handleOpenForm()} variant="outline" data-testid="add-first-itinerary-btn">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope' }}>
                  {formatDate(date)}
                </h3>
              </div>
              <div className="space-y-3 ml-6 border-l-2 border-slate-200 pl-4">
                {groupedByDate[date].map((item) => (
                  <Card key={item.id} className="border-slate-200" data-testid={`itinerary-item-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {item.waktu}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {item.lokasi}
                            </span>
                          </div>
                          <p className="text-slate-900 font-medium">{item.kegiatan}</p>
                          {item.catatan && (
                            <p className="text-sm text-slate-500 mt-1">{item.catatan}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => handleOpenForm(item)}
                            data-testid={`edit-itinerary-btn-${item.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => setDeleteId(item.id)}
                            data-testid={`delete-itinerary-btn-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>
              {editingId ? 'Edit Itinerary' : 'Tambah Itinerary'}
            </DialogTitle>
            <DialogDescription>
              Masukkan detail kegiatan perjalanan dinas
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal" className="label-field">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  min={startDate}
                  max={endDate}
                  value={form.tanggal}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="itinerary-tanggal-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktu" className="label-field">
                  Waktu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="waktu"
                  name="waktu"
                  type="time"
                  value={form.waktu}
                  onChange={handleChange}
                  className="input-field"
                  data-testid="itinerary-waktu-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kegiatan" className="label-field">
                Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kegiatan"
                name="kegiatan"
                placeholder="Deskripsi kegiatan"
                value={form.kegiatan}
                onChange={handleChange}
                className="input-field"
                data-testid="itinerary-kegiatan-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi" className="label-field">
                Lokasi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lokasi"
                name="lokasi"
                placeholder="Lokasi kegiatan"
                value={form.lokasi}
                onChange={handleChange}
                className="input-field"
                data-testid="itinerary-lokasi-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan" className="label-field">
                Catatan
              </Label>
              <Textarea
                id="catatan"
                name="catatan"
                placeholder="Catatan tambahan (opsional)"
                value={form.catatan}
                onChange={handleChange}
                className="input-field"
                data-testid="itinerary-catatan-input"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Batal
              </Button>
              <Button type="submit" className="btn-primary" disabled={loading} data-testid="submit-itinerary-btn">
                {loading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>Hapus Itinerary</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kegiatan ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              data-testid="confirm-delete-itinerary-btn"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
