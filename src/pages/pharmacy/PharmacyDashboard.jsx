import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Pill, Check, Clock, Package, Plus, Trash2, Edit2, Search, AlertCircle, FileText } from 'lucide-react';

const PharmacyDashboard = () => {
    const { prescriptions, completePrescription, medicines, addMedicine, updateMedicine, deleteMedicine, queue } = useClinic();
    const { addToast } = useToast();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' or 'stock'
    const [highlightId, setHighlightId] = useState(null);

    useEffect(() => {
        if (location.state?.medicineId) {
            setActiveTab('stock');
            setHighlightId(location.state.medicineId);
            // Clear highlight after 3 seconds
            setTimeout(() => setHighlightId(null), 3000);
        }
    }, [location.state]);

    // Stock Management State
    const [isEditing, setIsEditing] = useState(false);
    const [currentMed, setCurrentMed] = useState({ name: '', stock: '', unit: '', price: '' });

    const pendingPrescriptions = prescriptions.filter(p => {
        const queueItem = queue.find(q => q.patientId === p.patientId);
        return p.status === 'pending' && queueItem?.status === 'pharmacy';
    });
    const completedPrescriptions = prescriptions.filter(p => p.status === 'completed');

    // Metrics
    const totalPrescriptions = prescriptions.length;
    const pendingCount = pendingPrescriptions.length;
    const lowStockCount = medicines.filter(m => m.stock < 10).length;

    const handleComplete = async (id) => {
        try {
            await completePrescription(id);
            addToast('Resep selesai disiapkan!', 'success');
        } catch (error) {
            addToast(error.message || 'Gagal menyelesaikan resep', 'error');
        }
    };

    const handleSaveMedicine = async (e) => {
        e.preventDefault();
        if (!currentMed.name || !currentMed.stock) return;

        const medData = {
            ...currentMed,
            stock: parseInt(currentMed.stock),
            price: parseInt(currentMed.price)
        };

        try {
            if (isEditing) {
                await updateMedicine(currentMed.id, medData);
                addToast('Obat berhasil diperbarui!', 'success');
            } else {
                await addMedicine(medData);
                addToast('Obat baru berhasil ditambahkan!', 'success');
            }
            setIsEditing(false);
            setCurrentMed({ name: '', stock: '', unit: '', price: '' });
        } catch (error) {
            addToast(error.message || 'Gagal menyimpan data obat', 'error');
        }
    };

    const handleEditClick = (med) => {
        setCurrentMed(med);
        setIsEditing(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Yakin ingin menghapus obat ini?')) {
            try {
                await deleteMedicine(id);
                addToast('Obat dihapus.', 'info');
            } catch (error) {
                addToast(error.message || 'Gagal menghapus obat', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Farmasi & Apotek</h2>
                    <p className="text-secondary-500 mt-1">Kelola resep obat dan stok gudang farmasi.</p>
                </div>
                <div className="flex bg-secondary-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'prescriptions'
                            ? 'bg-white shadow-sm text-primary-600'
                            : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                    >
                        Resep Masuk
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'stock'
                            ? 'bg-white shadow-sm text-primary-600'
                            : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                    >
                        Manajemen Stok
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card gradientTitle variant="gradient" className="border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Total Resep</p>
                            <h3 className="text-3xl font-bold text-secondary-900">{totalPrescriptions}</h3>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <FileText size={24} />
                        </div>
                    </div>
                </Card>

                <Card gradientTitle variant="gradient" className="border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Menunggu Disiapkan</p>
                            <h3 className="text-3xl font-bold text-secondary-900">{pendingCount}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </Card>

                <Card gradientTitle variant="gradient" className="border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Stok Menipis</p>
                            <h3 className="text-3xl font-bold text-secondary-900">{lowStockCount}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {activeTab === 'prescriptions' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Prescriptions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 text-secondary-700 font-semibold pb-2 border-b border-secondary-200">
                            <Clock size={20} className="text-orange-500" />
                            <h3>Menunggu Penyiapan ({pendingPrescriptions.length})</h3>
                        </div>

                        {pendingPrescriptions.length === 0 ? (
                            <Card className="py-12 text-center text-secondary-400 border-dashed border-2 border-secondary-200 bg-secondary-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Check size={24} className="text-secondary-300" />
                                </div>
                                <p>Semua resep telah disiapkan.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {pendingPrescriptions.map((item) => (
                                    <Card key={item.id} className="p-0 overflow-hidden border-l-4 border-l-orange-400">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-secondary-900">{item.patientName}</h4>
                                                    <p className="text-sm text-secondary-500 font-mono mt-1">ID: {item.patientId}</p>
                                                </div>
                                                <Badge variant="warning">Menunggu</Badge>
                                            </div>

                                            <div className="bg-secondary-50 rounded-xl p-4 mb-5 border border-secondary-100">
                                                <h5 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                                                    <Pill size={16} className="text-primary-500" />
                                                    Daftar Obat
                                                </h5>
                                                <ul className="space-y-3">
                                                    {item.medicines.map((med, idx) => (
                                                        <li key={idx} className="text-sm flex justify-between items-center border-b border-secondary-200 pb-2 last:border-0 last:pb-0">
                                                            <span className="text-secondary-800 font-medium">{med.name} <span className="text-secondary-400 font-normal">({med.dosage})</span></span>
                                                            <span className="bg-white px-2 py-1 rounded border border-secondary-200 text-secondary-600 font-mono text-xs">x{med.amount}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button onClick={() => handleComplete(item.id)} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                                    <Check size={18} className="mr-2" />
                                                    Tandai Selesai
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed History */}
                    <div>
                        <div className="flex items-center gap-2 text-secondary-700 font-semibold pb-2 border-b border-secondary-200 mb-6">
                            <Check size={20} className="text-emerald-500" />
                            <h3>Riwayat Selesai</h3>
                        </div>

                        <div className="space-y-4">
                            {completedPrescriptions.slice(0, 5).map((item) => (
                                <Card key={item.id} className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-secondary-900">{item.patientName}</span>
                                        <Badge variant="success" size="sm">Selesai</Badge>
                                    </div>
                                    <p className="text-xs text-secondary-500 flex items-center gap-1">
                                        <Package size={12} />
                                        {item.medicines.length} jenis obat
                                    </p>
                                </Card>
                            ))}
                            {completedPrescriptions.length === 0 && (
                                <div className="text-center py-8 text-secondary-400 bg-secondary-50 rounded-xl border border-dashed border-secondary-200">
                                    <p className="text-sm italic">Belum ada resep selesai.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add/Edit Form */}
                    <div className="lg:col-span-1">
                        <Card title={isEditing ? "Edit Obat" : "Tambah Obat Baru"} className="sticky top-6">
                            <form onSubmit={handleSaveMedicine} className="space-y-5">
                                <Input
                                    label="Nama Obat"
                                    placeholder="Contoh: Paracetamol"
                                    value={currentMed.name}
                                    onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Stok"
                                        type="number"
                                        placeholder="0"
                                        value={currentMed.stock}
                                        onChange={(e) => setCurrentMed({ ...currentMed, stock: e.target.value })}
                                        required
                                        className="bg-white"
                                    />
                                    <Input
                                        label="Satuan"
                                        placeholder="Tablet"
                                        value={currentMed.unit}
                                        onChange={(e) => setCurrentMed({ ...currentMed, unit: e.target.value })}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                                <Input
                                    label="Harga Satuan (Rp)"
                                    type="number"
                                    placeholder="0"
                                    value={currentMed.price}
                                    onChange={(e) => setCurrentMed({ ...currentMed, price: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                                <div className="flex gap-3 pt-2">
                                    {isEditing && (
                                        <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setCurrentMed({ name: '', stock: '', unit: '', price: '' }); }} className="flex-1">
                                            Batal
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2 shadow-lg shadow-primary-200">
                                        <Package size={18} />
                                        {isEditing ? 'Simpan' : 'Tambah Stok'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Stock List */}
                    <div className="lg:col-span-2">
                        <Card title="Daftar Stok Obat">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-secondary-50 text-secondary-500 uppercase text-xs font-semibold border-b border-secondary-200">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-lg">Nama Obat</th>
                                            <th className="px-6 py-4">Stok</th>
                                            <th className="px-6 py-4">Satuan</th>
                                            <th className="px-6 py-4">Harga</th>
                                            <th className="px-6 py-4 text-right rounded-tr-lg">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100">
                                        {medicines.map((med) => (
                                            <tr
                                                key={med.id}
                                                className={`hover:bg-secondary-50/80 transition-colors duration-300 ${highlightId === med.id ? 'bg-yellow-50' : ''}`}
                                            >
                                                <td className="px-6 py-4 font-medium text-secondary-900">{med.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${med.stock < 10
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                        {med.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-secondary-500">{med.unit}</td>
                                                <td className="px-6 py-4 text-secondary-900 font-mono">Rp {parseInt(med.price).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEditClick(med)} className="text-primary-600 hover:text-primary-800 p-1.5 hover:bg-primary-50 rounded-lg transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(med.id)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {medicines.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-secondary-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Package size={32} className="text-secondary-300 mb-3" />
                                                        <p>Belum ada data obat.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
