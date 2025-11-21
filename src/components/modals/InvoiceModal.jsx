import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

const InvoiceModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none animate-in fade-in zoom-in duration-200">
                {/* Modal Header - Hidden on Print */}
                <div className="flex justify-between items-center p-5 border-b border-secondary-100 print:hidden">
                    <div className="flex items-center gap-2">
                        <FileText className="text-primary-500" size={20} />
                        <h3 className="font-bold text-secondary-900 text-lg">Preview Invoice</h3>
                    </div>
                    <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors p-1 rounded-lg hover:bg-secondary-50">
                        <X size={20} />
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="p-8 print:p-0" id="invoice-content">
                    {/* Clinic Header */}
                    <div className="text-center mb-8 border-b-2 border-primary-500 pb-6">
                        <h1 className="text-3xl font-bold text-primary-600 mb-2 tracking-tight">KLINIK SENTOSA</h1>
                        <p className="text-secondary-600 text-sm">Jl. Kesehatan No. 123, Jakarta Selatan</p>
                        <p className="text-secondary-600 text-sm">Telp: (021) 555-0123 | Email: info@kliniksentosa.com</p>
                    </div>

                    {/* Invoice Info */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1 font-semibold">Ditagihkan Kepada</p>
                            <h3 className="text-xl font-bold text-secondary-900">{data.patientName}</h3>
                            <p className="text-secondary-600 text-sm mt-1">ID Pasien: <span className="font-mono text-secondary-800">{data.patientId}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1 font-semibold">Invoice Info</p>
                            <p className="text-secondary-900 font-medium">#{Date.now().toString().slice(-6)}</p>
                            <p className="text-secondary-600 text-sm mt-1">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-secondary-200">
                                <th className="text-left py-3 text-sm font-bold text-secondary-600 uppercase tracking-wider">Deskripsi</th>
                                <th className="text-right py-3 text-sm font-bold text-secondary-600 uppercase tracking-wider">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {data.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-secondary-800">{item.name}</td>
                                    <td className="py-4 text-right text-secondary-800 font-medium">Rp {item.amount.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-secondary-900">
                                <td className="py-4 text-lg font-bold text-secondary-900">Total Tagihan</td>
                                <td className="py-4 text-right text-lg font-bold text-primary-600">Rp {data.total.toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div className="text-center mt-12 pt-8 border-t border-secondary-100">
                        <p className="text-secondary-600 italic mb-2">Terima kasih atas kepercayaan Anda.</p>
                        <p className="text-xs text-secondary-400">Dokumen ini sah dan dicetak oleh komputer.</p>
                    </div>
                </div>

                {/* Modal Footer - Hidden on Print */}
                <div className="p-5 bg-secondary-50 border-t border-secondary-100 flex justify-end gap-3 print:hidden">
                    <Button variant="outline" onClick={onClose} className="border-secondary-300 text-secondary-700 hover:bg-white">
                        Tutup
                    </Button>
                    <Button onClick={handlePrint} className="flex items-center gap-2 shadow-lg shadow-primary-200">
                        <Printer size={18} />
                        Cetak Sekarang
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
