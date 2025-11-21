import React, { createContext, useContext, useState, useEffect } from 'react';

const ClinicContext = createContext();
const API_URL = 'http://localhost:3000';

export const useClinic = () => {
    const context = useContext(ClinicContext);
    if (!context) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
};

export const ClinicProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [queue, setQueue] = useState([]);
    const [examinations, setExaminations] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check for persisted login
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Fetch data on mount (and periodically/on change ideally, but simple fetch for now)
    const fetchData = async () => {
        try {
            const [p, q, e, pr, t, m] = await Promise.all([
                fetch(`${API_URL}/patients`).then(res => res.json()),
                fetch(`${API_URL}/queue`).then(res => res.json()),
                fetch(`${API_URL}/examinations`).then(res => res.json()),
                fetch(`${API_URL}/prescriptions`).then(res => res.json()),
                fetch(`${API_URL}/transactions`).then(res => res.json()),
                fetch(`${API_URL}/medicines`).then(res => res.json()),
            ]);
            setPatients(p);
            setQueue(q);
            setExaminations(e);
            setPrescriptions(pr);
            setTransactions(t);
            setMedicines(m);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // Auth Actions
    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/users?username=${username}&password=${password}`);
            const users = await res.json();
            if (users.length > 0) {
                const userData = users[0];
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Login error", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setPatients([]);
        setQueue([]);
    };

    // Data Actions
    const addPatient = async (patientData) => {
        const newPatient = { ...patientData, id: Date.now().toString(), registeredAt: new Date().toISOString() };

        // 1. Add to Patients
        await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPatient)
        });

        // 2. Add to Queue
        const queueItem = {
            id: Date.now().toString(),
            patientId: newPatient.id,
            patientName: newPatient.name,
            status: 'waiting',
            joinedAt: new Date().toISOString(),
        };

        await fetch(`${API_URL}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queueItem)
        });

        fetchData(); // Refresh data
    };

    const updateQueueStatus = async (queueId, status) => {
        await fetch(`${API_URL}/queue/${queueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData();
    };

    const addExamination = async (exam) => {
        const newExam = { ...exam, id: Date.now().toString(), date: new Date().toISOString() };

        await fetch(`${API_URL}/examinations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExam)
        });

        // Move patient to payment regardless of prescription
        const queueItem = queue.find(q => q.patientId === exam.patientId && q.status === 'examining');
        if (queueItem) {
            await updateQueueStatus(queueItem.id, 'payment');
        } else {
            fetchData();
        }
    };

    const addPrescription = async (prescription) => {
        const newPrescription = { ...prescription, id: Date.now().toString(), status: 'pending' };

        await fetch(`${API_URL}/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPrescription)
        });

        // Deduct stock
        for (const med of prescription.medicines) {
            const currentMed = medicines.find(m => m.id === med.id);
            if (currentMed) {
                const newStock = currentMed.stock - parseInt(med.amount);
                await updateMedicine(med.id, { stock: newStock });
            }
        }

        fetchData();
    };

    const completePrescription = async (prescriptionId) => {
        await fetch(`${API_URL}/prescriptions/${prescriptionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });

        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (prescription) {
            const queueItem = queue.find(q => q.patientId === prescription.patientId && q.status === 'pharmacy');
            if (queueItem) await updateQueueStatus(queueItem.id, 'completed');
        } else {
            fetchData();
        }
    }

    const processPayment = async (payment) => {
        const newTransaction = { ...payment, id: Date.now().toString(), date: new Date().toISOString() };

        await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
        });

        const queueItem = queue.find(q => q.patientId === payment.patientId && q.status === 'payment');
        if (queueItem) {
            // Check if patient has prescription
            const hasPrescription = prescriptions.some(p => p.patientId === payment.patientId && p.status === 'pending');

            if (hasPrescription) {
                await updateQueueStatus(queueItem.id, 'pharmacy');
            } else {
                await updateQueueStatus(queueItem.id, 'completed');
            }
        } else {
            fetchData();
        }
    };

    // Medicine Actions
    const addMedicine = async (medicine) => {
        await fetch(`${API_URL}/medicines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...medicine, id: Date.now().toString() })
        });
        fetchData();
    };

    const updateMedicine = async (id, updates) => {
        await fetch(`${API_URL}/medicines/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        fetchData();
    };

    const deleteMedicine = async (id) => {
        await fetch(`${API_URL}/medicines/${id}`, {
            method: 'DELETE'
        });
        fetchData();
    };

    const value = {
        user,
        loading,
        login,
        logout,
        patients,
        queue,
        examinations,
        prescriptions,
        transactions,
        medicines,
        addPatient,
        updateQueueStatus,
        addExamination,
        addPrescription,
        completePrescription,
        processPayment,
        addMedicine,
        updateMedicine,
        deleteMedicine
    };

    return (
        <ClinicContext.Provider value={value}>
            {children}
        </ClinicContext.Provider>
    );
};
