import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, Clock, Calendar, ArrowRight, Activity, CheckCircle } from 'lucide-react';

const DoctorDashboard = () => {
    const { queue, patients, examinations, updateQueueStatus, searchQuery } = useClinic();
    const navigate = useNavigate();

    // Filter for today's data
    const today = new Date().toISOString().split('T')[0];

    const waitingQueue = queue.filter(q => {
        const isWaiting = q.status === 'waiting';
        const patient = patients.find(p => p.id === q.patientId);
        const matchesSearch = patient?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return isWaiting && matchesSearch;
    });
    const completedToday = examinations.filter(e => e.date.startsWith(today)).length;
    const totalPatientsToday = patients.filter(p => p.registeredAt.startsWith(today)).length;

    const stats = [
        { label: 'Antrian Menunggu', value: waitingQueue.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Selesai Diperiksa', value: completedToday, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Pasien Hari Ini', value: totalPatientsToday, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
    ];

    // Check if there's an active examination
    const activeExamItem = queue.find(q => q.status === 'examining');
    const currentQueueItem = activeExamItem || waitingQueue[0];

    const currentPatient = currentQueueItem
        ? patients.find(p => p.id === currentQueueItem.patientId)
        : null;

    const handleStartExamination = async () => {
        if (activeExamItem) {
            // Resume existing exam
            navigate(`/doctor/examination/${activeExamItem.id}`);
        } else if (currentQueueItem) {
            // Start new exam
            await updateQueueStatus(currentQueueItem.id, 'examining');
            navigate(`/doctor/examination/${currentQueueItem.id}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Dashboard Dokter</h1>
                    <p className="text-secondary-500">Selamat pagi, dr. Sentosa</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-500 bg-white px-3 py-1.5 rounded-lg border border-secondary-200 shadow-sm">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-secondary-900">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Current Patient */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title={activeExamItem ? "Sedang Diperiksa" : "Pasien Berikutnya"} className="h-full">
                        {currentPatient ? (
                            <>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
                                            <div>
                                                <p className="text-sm text-primary-600 font-medium">Nomor Antrian</p>
                                                <h2 className="text-3xl font-bold text-primary-700">#{currentQueueItem.id.slice(-4)}</h2>
                                            </div>
                                            <Badge variant={activeExamItem ? "warning" : "info"} className="px-3 py-1">
                                                {activeExamItem ? "Sedang Diperiksa" : "Menunggu"}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                                <p className="text-xs text-secondary-500">Nama Pasien</p>
                                                <p className="font-semibold text-secondary-900">{currentPatient.name}</p>
                                            </div>
                                            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                                <p className="text-xs text-secondary-500">No. RM</p>
                                                <p className="font-semibold text-secondary-900">#{currentPatient.id.slice(-6)}</p>
                                            </div>
                                            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                                <p className="text-xs text-secondary-500">Usia</p>
                                                <p className="font-semibold text-secondary-900">{currentPatient.age} th</p>
                                            </div>
                                            <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                                <p className="text-xs text-secondary-500">Keluhan Utama</p>
                                                <p className="font-semibold text-secondary-900 truncate">{currentPatient.complaint}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Button
                                        className="w-full"
                                        variant="primary"
                                        onClick={handleStartExamination}
                                    >
                                        <Activity size={18} className="mr-2" />
                                        {activeExamItem ? 'Lanjutkan Pemeriksaan' : 'Mulai Pemeriksaan'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-secondary-400">
                                <Users size={48} className="mb-4 opacity-20" />
                                <p>Tidak ada pasien yang menunggu saat ini.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar - Queue List */}
                <div className="lg:col-span-1">
                    <Card title="Antrian Berikutnya" className="h-full">
                        <div className="space-y-4">
                            {waitingQueue.length > 0 ? (
                                waitingQueue.slice(0, 5).map((q, index) => {
                                    const patient = patients.find(p => p.id === q.patientId);
                                    if (!patient) return null;
                                    return (
                                        <div key={q.id} className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg transition-colors border border-transparent hover:border-secondary-100 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-medium text-xs group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-secondary-900">{patient.name}</p>
                                                    <p className="text-xs text-secondary-500">#{patient.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center text-xs text-secondary-500 mb-1">
                                                    <Clock size={12} className="mr-1" />
                                                    {new Date(q.joinedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-secondary-400 py-8 text-sm">Antrian kosong</p>
                            )}
                        </div>
                        {waitingQueue.length > 5 && (
                            <div className="mt-6 pt-4 border-t border-secondary-100">
                                <Button variant="ghost" className="w-full text-sm">
                                    Lihat Semua Antrian
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
