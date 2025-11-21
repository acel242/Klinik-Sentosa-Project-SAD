import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserPlus, Save, User, Phone, FileText, Calendar } from 'lucide-react';

const Registration = () => {
    const { addPatient } = useClinic();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        contact: '',
        complaint: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addPatient(formData);
            addToast('Pasien berhasil didaftarkan!', 'success');
            setFormData({ name: '', age: '', contact: '', complaint: '' });
        } catch (error) {
            addToast('Gagal mendaftarkan pasien.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Pendaftaran Pasien</h2>
                    <p className="text-secondary-500 mt-1">Daftarkan pasien baru untuk masuk ke antrian pemeriksaan.</p>
                </div>
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600">
                    <UserPlus size={24} />
                </div>
            </div>

            <Card className="border-t-4 border-t-primary-500">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-secondary-800 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                <User size={18} className="text-primary-500" />
                                Data Diri
                            </h3>

                            <Input
                                label="Nama Lengkap"
                                placeholder="Contoh: Budi Santoso"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-white"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Umur"
                                    type="number"
                                    placeholder="30"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                    icon={Calendar}
                                    className="bg-white"
                                />
                                <Input
                                    label="Nomor Kontak"
                                    placeholder="0812..."
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    required
                                    icon={Phone}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-secondary-800 border-b border-secondary-100 pb-2 flex items-center gap-2">
                                <FileText size={18} className="text-primary-500" />
                                Data Medis
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Keluhan Utama</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all min-h-[180px] text-secondary-900 placeholder-secondary-400 resize-none"
                                    placeholder="Jelaskan keluhan yang dirasakan pasien secara detail..."
                                    value={formData.complaint}
                                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-secondary-100 flex justify-end">
                        <Button
                            type="submit"
                            className="w-full md:w-auto min-w-[200px] justify-center"
                            disabled={loading}
                        >
                            <Save size={18} className="mr-2" />
                            {loading ? 'Menyimpan...' : 'Daftarkan Pasien'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Registration;
