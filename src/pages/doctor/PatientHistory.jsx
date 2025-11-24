import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText } from 'lucide-react';

const PatientHistory = () => {
    const { examinations, searchQuery } = useClinic();
    const location = useLocation();
    const navigate = useNavigate();
    const [filterId, setFilterId] = useState(null);

    useEffect(() => {
        if (location.state?.patientId) {
            setFilterId(location.state.patientId);
        }
    }, [location.state]);

    const filteredExaminations = examinations.filter(e => {
        const matchesFilter = filterId ? e.patientId === filterId : true;
        const matchesSearch = e.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const clearFilter = () => {
        setFilterId(null);
        navigate(location.pathname, { replace: true, state: {} });
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Pasien</h1>
                    <p className="text-gray-500">Daftar riwayat pemeriksaan pasien.</p>
                </div>
                {filterId && (
                    <button
                        onClick={clearFilter}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Tampilkan Semua
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                {filteredExaminations.length === 0 ? (
                    <Card className="text-center py-12">
                        <FileText className="mx-auto text-gray-400 mb-4" size={32} />
                        <h3 className="text-lg font-medium text-gray-900">Belum ada riwayat</h3>
                        <p className="text-gray-500">Belum ada pemeriksaan yang dilakukan.</p>
                    </Card>
                ) : (
                    filteredExaminations.map((exam) => (
                        <Card key={exam.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900">{exam.patientName}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(exam.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <Badge>{exam.diagnosis}</Badge>
                            </div>
                            <p className="text-gray-700 text-sm mt-2">{exam.notes || "Tidak ada catatan tambahan."}</p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
