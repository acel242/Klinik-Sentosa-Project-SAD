import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Package, Plus, AlertTriangle, Search, Edit2, Save, X } from 'lucide-react';

const Inventory = () => {
    const { medicines, updateMedicineStock, addMedicine, searchQuery } = useClinic();
    const { addToast } = useToast();
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newMedicine, setNewMedicine] = useState({ name: '', stock: '', unit: '', price: '' });

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateStock = async (id) => {
        await updateMedicineStock(id, parseInt(editStock));
        setEditingId(null);
        addToast('Stok berhasil diperbarui', 'success');
    };

    const handleAddMedicine = async () => {
        if (!newMedicine.name || !newMedicine.stock || !newMedicine.price) {
            addToast('Mohon lengkapi data obat', 'error');
            return;
        }

        await addMedicine({
            ...newMedicine,
            stock: parseInt(newMedicine.stock),
            price: parseInt(newMedicine.price)
        });

        setIsAdding(false);
        setNewMedicine({ name: '', stock: '', unit: '', price: '' });
        addToast('Obat baru berhasil ditambahkan', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Stok Obat</h1>
                    <p className="text-secondary-500">Kelola inventaris obat-obatan</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus size={20} className="mr-2" />
                    Tambah Obat
                </Button>
            </div>

            {/* Add Medicine Form */}
            {isAdding && (
                <Card className="bg-primary-50 border-primary-100">
                    <h3 className="font-semibold text-primary-900 mb-4">Tambah Obat Baru</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Nama Obat"
                            value={newMedicine.name}
                            onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })}
                        />
                        <Input
                            placeholder="Stok Awal"
                            type="number"
                            value={newMedicine.stock}
                            onChange={e => setNewMedicine({ ...newMedicine, stock: e.target.value })}
                        />
                        <Input
                            placeholder="Satuan (Tablet/Botol)"
                            value={newMedicine.unit}
                            onChange={e => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                        />
                        <Input
                            placeholder="Harga Satuan"
                            type="number"
                            value={newMedicine.price}
                            onChange={e => setNewMedicine({ ...newMedicine, price: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
                        <Button onClick={handleAddMedicine}>Simpan</Button>
                    </div>
                </Card>
            )}

            {/* Search and List */}
            <Card>


                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary-50 text-secondary-500">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Nama Obat</th>
                                <th className="px-4 py-3">Satuan</th>
                                <th className="px-4 py-3">Harga</th>
                                <th className="px-4 py-3">Stok</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {filteredMedicines.map(med => (
                                <tr key={med.id} className="hover:bg-secondary-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-secondary-900">{med.name}</td>
                                    <td className="px-4 py-3 text-secondary-500">{med.unit}</td>
                                    <td className="px-4 py-3 text-secondary-500">Rp {med.price.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-3">
                                        {editingId === med.id ? (
                                            <div className="flex items-center gap-2 w-32">
                                                <Input
                                                    type="number"
                                                    value={editStock}
                                                    onChange={e => setEditStock(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <span className="font-medium text-secondary-900">{med.stock}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {med.stock <= 10 ? (
                                            <Badge variant="danger" className="flex w-fit items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Stok Menipis
                                            </Badge>
                                        ) : (
                                            <Badge variant="success">Tersedia</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingId === med.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                    <X size={16} />
                                                </button>
                                                <button onClick={() => handleUpdateStock(med.id)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded">
                                                    <Save size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(med.id);
                                                    setEditStock(med.stock);
                                                }}
                                                className="text-secondary-400 hover:text-primary-600 hover:bg-primary-50 p-1 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Inventory;
