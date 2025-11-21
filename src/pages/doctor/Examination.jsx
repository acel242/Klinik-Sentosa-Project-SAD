import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Save, Plus, Trash2, ArrowLeft, User, FileText, Pill } from 'lucide-react';

const Examination = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { queue, addExamination, addPrescription, medicines } = useClinic();
    const { addToast } = useToast();

    const [patient, setPatient] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medicinesList, setMedicinesList] = useState([]);
    const [currentMedId, setCurrentMedId] = useState('');
    const [currentDosage, setCurrentDosage] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');

    useEffect(() => {
        const queueItem = queue.find(q => q.id === id);
        if (queueItem) {
            setPatient(queueItem);
        } else {
            // navigate('/doctor/dashboard');
        }
    }, [id, queue, navigate]);

    const handleAddMedicine = () => {
        if (!currentMedId || !currentDosage || !currentAmount) return;

        const selectedMed = medicines.find(m => m.id === currentMedId);
        if (!selectedMed) return;

        if (parseInt(currentAmount) > selectedMed.stock) {
            addToast(`Stok tidak cukup! Sisa: ${selectedMed.stock}`, 'error');
            return;
        }

        setMedicinesList([...medicinesList, {
            id: selectedMed.id,
            name: selectedMed.name,
            dosage: currentDosage,
            amount: currentAmount
        }]);

        setCurrentMedId('');
        setCurrentDosage('');
        setCurrentAmount('');
    };

    const removeMedicine = (medId) => {
        setMedicinesList(medicinesList.filter(m => m.id !== medId));
    };

    const handleSubmit = async () => {
        if (!diagnosis) {
            addToast('Diagnosis harus diisi!', 'error');
            return;
        }

        const hasPrescription = medicinesList.length > 0;

        await addExamination({
            patientId: patient.patientId,
            patientName: patient.patientName,
            diagnosis,
            notes,
            hasPrescription
        });

        if (hasPrescription) {
            await addPrescription({
                patientId: patient.patientId,
                patientName: patient.patientName,
                medicines: medicinesList
            });
        }

        addToast('Pemeriksaan selesai!', 'success');
        navigate('/doctor/dashboard');
    };

    if (!patient) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => navigate('/doctor/dashboard')} className="p-2">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Pemeriksaan Pasien</h2>
                    <p className="text-gray-500">Isi data pemeriksaan dan resep obat</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Data Pasien">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{patient.patientName}</p>
                                    <p className="text-xs text-gray-500">ID: {patient.patientId}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-gray-500 block">Status Antrian</span>
                                    <Badge variant="warning">Sedang Diperiksa</Badge>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500 block">Waktu Masuk</span>
                                    <span className="font-medium text-gray-900">{new Date(patient.joinedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Examination Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Hasil Pemeriksaan">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                <Input
                                    placeholder="Contoh: Influenza"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Dokter</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[100px]"
                                    placeholder="Catatan tambahan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Resep Obat">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-1">
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        value={currentMedId}
                                        onChange={(e) => setCurrentMedId(e.target.value)}
                                    >
                                        <option value="">Pilih Obat...</option>
                                        {medicines.map(m => (
                                            <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                                                {m.name} (Stok: {m.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    placeholder="Dosis (3x1)"
                                    value={currentDosage}
                                    onChange={(e) => setCurrentDosage(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Jml"
                                        type="number"
                                        className="w-20"
                                        value={currentAmount}
                                        onChange={(e) => setCurrentAmount(e.target.value)}
                                    />
                                    <Button onClick={handleAddMedicine} className="flex-1">
                                        <Plus size={18} />
                                    </Button>
                                </div>
                            </div>

                            {medicinesList.length > 0 && (
                                <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2">Obat</th>
                                                <th className="px-4 py-2">Dosis</th>
                                                <th className="px-4 py-2">Jml</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {medicinesList.map((med) => (
                                                <tr key={med.id}>
                                                    <td className="px-4 py-2 font-medium">{med.name}</td>
                                                    <td className="px-4 py-2">{med.dosage}</td>
                                                    <td className="px-4 py-2">{med.amount}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <button onClick={() => removeMedicine(med.id)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => navigate('/doctor/dashboard')}>Batal</Button>
                        <Button onClick={handleSubmit} className="flex items-center gap-2">
                            <Save size={18} />
                            <span>Simpan Pemeriksaan</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Examination;
