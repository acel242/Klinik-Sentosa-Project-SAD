import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, ArrowRight, Clock, Activity } from 'lucide-react';

const QueueManagement = () => {
    const { queue, updateQueueStatus, searchQuery } = useClinic();
    const location = useLocation();
    const [highlightId, setHighlightId] = useState(null);

    useEffect(() => {
        if (location.state?.highlightId) {
            setHighlightId(location.state.highlightId);
            setTimeout(() => setHighlightId(null), 3000);
        }
    }, [location.state]);

    // Filter only active queues (not completed) and match search query
    const activeQueue = queue.filter(q =>
        q.status !== 'completed' &&
        q.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'waiting': return <Badge variant="warning">Menunggu</Badge>;
            case 'examining': return <Badge variant="info">Diperiksa</Badge>;
            case 'pharmacy': return <Badge variant="primary">Apotek</Badge>;
            case 'payment': return <Badge variant="success">Pembayaran</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const handleCall = (id) => {
        updateQueueStatus(id, 'examining');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Manajemen Antrian</h1>
                    <p className="text-secondary-500 mt-1">Pantau dan kelola antrian pasien secara real-time.</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Total Antrian</span>
                        <div className="text-xl font-bold text-secondary-900">{activeQueue.length}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {activeQueue.length === 0 ? (
                    <Card className="text-center py-16 border-dashed border-2 border-secondary-200 bg-secondary-50/50">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-secondary-100">
                            <Users className="text-secondary-300" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900">Tidak ada antrian</h3>
                        <p className="text-secondary-500 max-w-sm mx-auto mt-2">Belum ada pasien yang terdaftar saat ini. Silakan daftarkan pasien baru.</p>
                    </Card>
                ) : (
                    activeQueue.map((item, index) => (
                        <Card
                            key={item.id}
                            className={`flex flex-col md:flex-row md:items-center justify-between p-5 transition-all duration-500 ${highlightId === item.patientId
                                ? 'bg-yellow-50 border-yellow-200 shadow-md ring-1 ring-yellow-200'
                                : 'hover:border-primary-200 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-700 font-bold text-lg border border-secondary-100">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 text-lg">{item.patientName}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <span className="text-xs font-medium text-secondary-400 bg-secondary-50 px-2 py-1 rounded-md border border-secondary-100">
                                            ID: {item.patientId.slice(-4)}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-secondary-500">
                                            <Clock size={12} />
                                            <span>{new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                            </div>

                            {item.status === 'waiting' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleCall(item.id)}
                                    className="flex items-center gap-2 w-full md:w-auto justify-center"
                                >
                                    <Activity size={16} />
                                    Panggil Pasien
                                    <ArrowRight size={16} />
                                </Button>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default QueueManagement;
