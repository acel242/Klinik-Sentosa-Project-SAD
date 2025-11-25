import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, Clock, CreditCard, Activity, UserPlus, FileText, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
    const { patients = [], queue = [], transactions = [] } = useClinic();
    const navigate = useNavigate();

    // Calculate Metrics
    const today = new Date().toISOString().split('T')[0];
    const patientsToday = Array.isArray(patients) ? patients.filter(p => p.registeredAt?.startsWith(today)).length : 0;
    const pendingPayments = Array.isArray(queue) ? queue.filter(q => q.status === 'payment') : [];

    // Calculate Revenue and Profit (Assuming 40% profit margin for demo)
    const totalRevenue = Array.isArray(transactions) ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) : 0;
    const totalProfit = totalRevenue * 0.4;

    // Prepare Chart Data (Last 7 days)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();
    const chartData = last7Days.map(date => {
        const dayTransactions = Array.isArray(transactions) ? transactions.filter(t => t.date?.startsWith(date)) : [];
        const dayRevenue = dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        return {
            date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            revenue: dayRevenue,
            profit: dayRevenue * 0.4
        };
    });

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100000); // Min 100k for scale

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Dashboard Admin</h2>
                    <p className="text-secondary-500 mt-1">Ringkasan aktivitas klinik hari ini.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-500 bg-white px-4 py-2 rounded-full shadow-sm border border-secondary-100">
                    <Clock size={16} />
                    <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card gradientTitle variant="gradient" className="border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Pasien Hari Ini</p>
                            <h3 className="text-3xl font-bold text-secondary-900">{patientsToday}</h3>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card gradientTitle variant="gradient" className="border-l-4 border-l-emerald-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Total Pendapatan</p>
                            <h3 className="text-3xl font-bold text-secondary-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card gradientTitle variant="gradient" className="border-l-4 border-l-violet-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-secondary-500 text-sm font-medium mb-1">Estimasi Keuntungan</p>
                            <h3 className="text-3xl font-bold text-secondary-900">Rp {totalProfit.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue & Profit Chart */}
                <Card className="lg:col-span-2" title="Grafik Pendapatan & Keuntungan (7 Hari Terakhir)">
                    <div className="relative h-64 mt-4">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-secondary-400">
                            <div className="border-b border-secondary-100 w-full h-0"></div>
                            <div className="border-b border-secondary-100 w-full h-0"></div>
                            <div className="border-b border-secondary-100 w-full h-0"></div>
                            <div className="border-b border-secondary-100 w-full h-0"></div>
                            <div className="border-b border-secondary-100 w-full h-0"></div>
                        </div>

                        {/* Bars */}
                        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pt-6">
                            {chartData.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col justify-end gap-1 group relative h-full">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-secondary-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
                                        <p>Rev: Rp {data.revenue.toLocaleString('id-ID')}</p>
                                        <p>Pft: Rp {data.profit.toLocaleString('id-ID')}</p>
                                    </div>

                                    {/* Bar Container */}
                                    <div className="w-full h-full flex items-end relative">
                                        {/* Revenue Bar */}
                                        <div
                                            className="w-full bg-primary-200 rounded-t-sm hover:bg-primary-300 transition-all relative"
                                            style={{ height: `${Math.max((data.revenue / maxRevenue) * 100, 2)}%` }} // Min height 2%
                                        >
                                            {/* Profit Bar (Overlay) */}
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-t-sm opacity-80"
                                                style={{ height: `${data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-secondary-500 mt-2">{data.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-200 rounded-sm"></div>
                            <span className="text-xs text-secondary-500">Pendapatan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-500 rounded-sm"></div>
                            <span className="text-xs text-secondary-500">Keuntungan</span>
                        </div>
                    </div>
                </Card>

                {/* Pending Payments */}
                <Card title="Menunggu Pembayaran">
                    <div className="space-y-4">
                        {pendingPayments.length > 0 ? (
                            pendingPayments.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary-900">{item.patientName}</p>
                                            <p className="text-xs text-secondary-500">ID: {item.patientId}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => navigate('/admin/payment')}>
                                        Proses
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-secondary-400">
                                <CreditCard size={32} className="mx-auto mb-2 opacity-20" />
                                <p>Tidak ada tagihan pending</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
