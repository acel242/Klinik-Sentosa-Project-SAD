import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pill, Check, Clock, User } from 'lucide-react';

const Prescription = () => {
    const { prescriptions, updatePrescriptionStatus, medicines, updateMedicineStock } = useClinic();
    const { addToast } = useToast();

    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
    const completedPrescriptions = prescriptions.filter(p => p.status === 'completed');

    const handleProcessPrescription = async (prescription) => {
        // Check stock first
        for (const item of prescription.medicines) {
            const med = medicines.find(m => m.id === item.id);
            if (!med || med.stock < parseInt(item.amount)) {
                addToast(`Stok ${item.name} tidak mencukupi!`, 'error');
                return;
            }
        }

        // Update stock
        for (const item of prescription.medicines) {
            const med = medicines.find(m => m.id === item.id);
            await updateMedicineStock(item.id, med.stock - parseInt(item.amount));
        }

        // Update status
        await updatePrescriptionStatus(prescription.id, 'completed');
        addToast('Resep berhasil diproses', 'success');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">Resep Obat</h1>
                <p className="text-secondary-500">Kelola resep obat pasien</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Prescriptions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                        <Clock size={20} className="text-warning-500" />
                        Menunggu Diproses
                        <Badge variant="warning" className="ml-2">{pendingPrescriptions.length}</Badge>
                    </h2>

                    {pendingPrescriptions.length === 0 ? (
                        <Card className="p-8 text-center text-secondary-400">
                            <Pill size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Tidak ada resep yang menunggu</p>
                        </Card>
                    ) : (
                        pendingPrescriptions.map(prescription => (
                            <Card key={prescription.id} className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary-900">{prescription.patientName}</p>
                                            <p className="text-xs text-secondary-500">ID: {prescription.patientId}</p>
                                        </div>
                                    </div>
                                    <Badge variant="warning">Pending</Badge>
                                </div>

                                <div className="bg-secondary-50 rounded-lg p-3 space-y-2">
                                    <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Daftar Obat</p>
                                    {prescription.medicines.map((med, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-secondary-700">{med.name}</span>
                                            <span className="font-medium text-secondary-900">{med.amount} {med.unit || 'pcs'}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleProcessPrescription(prescription)}
                                >
                                    <Check size={18} className="mr-2" />
                                    Proses Resep
                                </Button>
                            </Card>
                        ))
                    )}
                </div>

                {/* Completed History */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                        <Check size={20} className="text-success-500" />
                        Riwayat Selesai
                    </h2>

                    <div className="space-y-4">
                        {completedPrescriptions.slice(0, 5).map(prescription => (
                            <Card key={prescription.id} className="opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-secondary-900">{prescription.patientName}</p>
                                        <p className="text-xs text-secondary-500">{prescription.medicines.length} jenis obat</p>
                                    </div>
                                    <Badge variant="success">Selesai</Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prescription;
