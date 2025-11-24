import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, TrendingUp, Filter, Calendar, CreditCard } from 'lucide-react';

const Transactions = () => {
    const { transactions, searchQuery } = useClinic();
    const location = useLocation();
    const navigate = useNavigate();
    const [filterId, setFilterId] = useState(null);

    useEffect(() => {
        if (location.state?.highlightId) {
            setFilterId(location.state.highlightId);
        }
    }, [location.state]);

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filterId ? t.patientId === filterId : true;
        const matchesSearch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const clearFilter = () => {
        setFilterId(null);
        navigate(location.pathname, { replace: true, state: {} });
    };

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Laporan Transaksi</h1>
                    <p className="text-secondary-500 mt-1">Rekapitulasi pendapatan dan riwayat transaksi klinik.</p>
                </div>
                {filterId && (
                    <button
                        onClick={clearFilter}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors shadow-sm"
                    >
                        <Filter size={16} />
                        Reset Filter
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-lg shadow-primary-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-primary-100 text-sm font-medium">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-secondary-600 to-secondary-700 text-white border-none shadow-lg shadow-secondary-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <FileText size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-secondary-100 text-sm font-medium">Total Transaksi</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">{filteredTransactions.length}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-lg shadow-emerald-200">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <CreditCard size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Rata-rata Transaksi</p>
                            <h3 className="text-2xl font-bold mt-1 text-white">
                                Rp {filteredTransactions.length > 0
                                    ? Math.round(totalRevenue / filteredTransactions.length).toLocaleString('id-ID')
                                    : 0}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Riwayat Transaksi" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary-50 border-b border-secondary-200 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                <th className="py-4 px-6">ID Transaksi</th>
                                <th className="py-4 px-6">Tanggal</th>
                                <th className="py-4 px-6">Pasien</th>
                                <th className="py-4 px-6">Metode</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-secondary-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText size={32} className="text-secondary-300 mb-3" />
                                            <p>Belum ada data transaksi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-secondary-50/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-mono text-secondary-500">#{t.id.slice(-6)}</td>
                                        <td className="py-4 px-6 text-sm text-secondary-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-secondary-400" />
                                                {new Date(t.date).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-secondary-900">{t.patientName}</td>
                                        <td className="py-4 px-6 text-sm text-secondary-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                                                {t.method}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="success">Lunas</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-secondary-900 text-right">
                                            Rp {t.amount.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Transactions;
