import { useState } from 'react';
import { expensesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';

export default function ExpenseSection({ tripId, expenses, onUpdate, startDate, endDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal: '',
    uraian: '',
    jumlah: '',
    catatan: '',
  });

  const resetForm = () => {
    setForm({
      tanggal: startDate || '',
      uraian: '',
      jumlah: '',
      catatan: '',
    });
    setEditingId(null);
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setForm({
        tanggal: item.tanggal,
        uraian: item.uraian,
        jumlah: item.jumlah.toString(),
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

  const handleAmountChange = (e) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, jumlah: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.uraian || !form.jumlah) {
      toast.error('Tanggal, uraian, dan jumlah harus diisi');
      return;
    }

    const data = {
      ...form,
      jumlah: parseFloat(form.jumlah),
    };

    setLoading(true);
    try {
      if (editingId) {
        await expensesAPI.update(tripId, editingId, data);
        toast.success('Biaya berhasil diperbarui');
      } else {
        await expensesAPI.create(tripId, data);
        toast.success('Biaya berhasil ditambahkan');
      }
      handleCloseForm();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan biaya');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await expensesAPI.delete(tripId, deleteId);
      toast.success('Biaya berhasil dihapus');
      onUpdate();
    } catch (error) {
      toast.error('Gagal menghapus biaya');
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatInputRupiah = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(value));
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.jumlah, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope' }}>
            Rincian Biaya
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Catat semua pengeluaran selama perjalanan dinas
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="btn-primary" data-testid="add-expense-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Biaya
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card className="border-slate-200 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2" style={{ fontFamily: 'Manrope' }}>
              Belum Ada Biaya
            </h3>
            <p className="text-slate-500 mb-4">
              Tambahkan rincian pengeluaran Anda
            </p>
            <Button onClick={() => handleOpenForm()} variant="outline" data-testid="add-first-expense-btn">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Biaya Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="w-12">No</TableHead>
                    <TableHead className="w-28">Tanggal</TableHead>
                    <TableHead>Uraian</TableHead>
                    <TableHead className="text-right w-36">Jumlah</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((item) => (
                    <TableRow key={item.id} className="table-row" data-testid={`expense-row-${item.id}`}>
                      <TableCell className="font-medium">{item.nomor}</TableCell>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{item.uraian}</p>
                          {item.catatan && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.catatan}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-900">
                        {formatRupiah(item.jumlah)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => handleOpenForm(item)}
                            data-testid={`edit-expense-btn-${item.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => setDeleteId(item.id)}
                            data-testid={`delete-expense-btn-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-bold">
                    <TableCell colSpan={3} className="text-right">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-700">
                      {formatRupiah(totalExpense)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Manrope' }}>
              {editingId ? 'Edit Biaya' : 'Tambah Biaya'}
            </DialogTitle>
            <DialogDescription>
              Masukkan detail pengeluaran
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                data-testid="expense-tanggal-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uraian" className="label-field">
                Uraian <span className="text-red-500">*</span>
              </Label>
              <Input
                id="uraian"
                name="uraian"
                placeholder="Deskripsi pengeluaran"
                value={form.uraian}
                onChange={handleChange}
                className="input-field"
                data-testid="expense-uraian-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah" className="label-field">
                Jumlah (Rp) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rp</span>
                <Input
                  id="jumlah"
                  name="jumlah"
                  placeholder="0"
                  value={formatInputRupiah(form.jumlah)}
                  onChange={handleAmountChange}
                  className="input-field pl-10 font-mono"
                  data-testid="expense-jumlah-input"
                />
              </div>
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
                data-testid="expense-catatan-input"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Batal
              </Button>
              <Button type="submit" className="btn-primary" disabled={loading} data-testid="submit-expense-btn">
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
            <DialogTitle style={{ fontFamily: 'Manrope' }}>Hapus Biaya</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengeluaran ini?
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
              data-testid="confirm-delete-expense-btn"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
