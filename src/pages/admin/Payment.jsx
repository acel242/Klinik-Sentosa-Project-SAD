import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, DollarSign, CheckCircle, Printer, User, Calendar, FileText } from 'lucide-react';
import InvoiceModal from '../../components/modals/InvoiceModal';

const Payment = () => {
    const { queue, examinations, prescriptions, processPayment } = useClinic();
    const { addToast } = useToast();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    // Filter patients waiting for payment
    const paymentQueue = queue.filter(q => q.status === 'payment');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.highlightId) {
            const patient = paymentQueue.find(p => p.patientId === location.state.highlightId);
            if (patient) {
                setSelectedPatient(patient);
                setIsPaid(false);
            }
        }
    }, [location.state, queue]);

    const getBillDetails = (patientId) => {
        const exam = examinations.find(e => e.patientId === patientId);
        const prescription = prescriptions.find(p => p.patientId === patientId);

        const examFee = 50000;
        const medFee = prescription ? prescription.medicines.length * 15000 : 0;
        const total = examFee + medFee;

        return { examFee, medFee, total, exam, prescription };
    };

    const handleProcessPayment = async () => {
        if (!selectedPatient) return;

        const bill = getBillDetails(selectedPatient.patientId);

        await processPayment({
            patientId: selectedPatient.patientId,
            patientName: selectedPatient.patientName,
            amount: bill.total,
            method: paymentMethod,
            items: [
                { name: 'Jasa Pemeriksaan', amount: bill.examFee },
                { name: 'Obat-obatan', amount: bill.medFee }
            ]
        });

        addToast('Pembayaran berhasil diproses!', 'success');
        setIsPaid(true);
    };

    const handleNextPatient = () => {
        setSelectedPatient(null);
        setIsPaid(false);
        setPaymentMethod('Tunai');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Kasir & Pembayaran</h2>
                    <p className="text-secondary-500 mt-1">Proses pembayaran dan cetak invoice pasien.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-2">
                    <CreditCard size={18} className="text-primary-500" />
                    <span className="text-sm font-medium text-secondary-600">
                        Antrian: <span className="text-secondary-900 font-bold">{paymentQueue.length}</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="lg:col-span-1">
                    <Card title="Antrian Pembayaran" className="h-full flex flex-col">
                        {paymentQueue.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-secondary-400">
                                <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle size={24} />
                                </div>
                                <p>Tidak ada antrian pembayaran.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paymentQueue.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => { setSelectedPatient(item); setIsPaid(false); }}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedPatient?.id === item.id
                                            ? 'bg-primary-50 border-primary-200 shadow-sm ring-1 ring-primary-200'
                                            : 'bg-white border-secondary-100 hover:border-primary-200 hover:bg-secondary-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-secondary-900">{item.patientName}</h4>
                                            <Badge variant="warning">Menunggu</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-secondary-500">
                                            <User size={12} />
                                            <span>ID: {item.patientId.slice(-4)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Payment Detail */}
                <div className="lg:col-span-2">
                    {selectedPatient ? (
                        <Card className="h-full flex flex-col">
                            <div className="border-b border-secondary-100 pb-6 mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-secondary-900">Detail Tagihan</h3>
                                    <div className="flex items-center gap-2 mt-1 text-secondary-500 text-sm">
                                        <FileText size={14} />
                                        <span>Invoice #{Date.now().toString().slice(-6)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 text-secondary-500 text-sm mb-1">
                                        <Calendar size={14} />
                                        <span>Tanggal</span>
                                    </div>
                                    <p className="font-medium text-secondary-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                                    <span className="text-secondary-600 font-medium">Nama Pasien</span>
                                    <span className="font-bold text-secondary-900 text-lg">{selectedPatient.patientName}</span>
                                </div>

                                <div className="border border-secondary-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary-50 text-secondary-600 border-b border-secondary-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-semibold">Deskripsi Item</th>
                                                <th className="px-6 py-4 text-right font-semibold">Biaya</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-100">
                                            <tr>
                                                <td className="px-6 py-4 text-secondary-700">Jasa Pemeriksaan Dokter</td>
                                                <td className="px-6 py-4 text-right font-medium text-secondary-900">Rp {getBillDetails(selectedPatient.patientId).examFee.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 text-secondary-700">Obat-obatan & Farmasi</td>
                                                <td className="px-6 py-4 text-right font-medium text-secondary-900">Rp {getBillDetails(selectedPatient.patientId).medFee.toLocaleString()}</td>
                                            </tr>
                                            <tr className="bg-primary-50/50">
                                                <td className="px-6 py-4 font-bold text-primary-900">Total Tagihan</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary-700 text-lg">Rp {getBillDetails(selectedPatient.patientId).total.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-3">Metode Pembayaran</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Tunai', 'Debit', 'QRIS'].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${paymentMethod === method
                                                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm ring-1 ring-primary-500'
                                                    : 'bg-white border-secondary-200 text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300'
                                                    }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-secondary-100 flex gap-3 justify-end">
                                {isPaid ? (
                                    <Button onClick={handleNextPatient} variant="outline" className="border-secondary-300 text-secondary-700">
                                        Selesai & Lanjut
                                    </Button>
                                ) : null}

                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 border-secondary-300 text-secondary-700 hover:bg-secondary-50"
                                    onClick={() => setShowInvoiceModal(true)}
                                    disabled={!isPaid}
                                >
                                    <Printer size={18} />
                                    <span>Cetak Invoice</span>
                                </Button>

                                {!isPaid && (
                                    <Button onClick={handleProcessPayment} className="min-w-[180px] justify-center shadow-lg shadow-primary-200">
                                        <DollarSign size={18} className="mr-2" />
                                        <span>Proses Pembayaran</span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-secondary-400 border-2 border-dashed border-secondary-200 rounded-2xl p-12 bg-secondary-50/50">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-secondary-100">
                                <CreditCard size={32} className="text-secondary-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-secondary-600">Belum ada pasien dipilih</h3>
                            <p className="text-sm mt-1">Pilih pasien dari antrian di sebelah kiri untuk memproses pembayaran</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedPatient && (
                <InvoiceModal
                    isOpen={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    data={{
                        patientName: selectedPatient.patientName,
                        patientId: selectedPatient.patientId,
                        items: [
                            { name: 'Jasa Pemeriksaan Dokter', amount: getBillDetails(selectedPatient.patientId).examFee },
                            { name: 'Obat-obatan & Farmasi', amount: getBillDetails(selectedPatient.patientId).medFee }
                        ],
                        total: getBillDetails(selectedPatient.patientId).total
                    }}
                />
            )}
        </div>
    );
};

export default Payment;
