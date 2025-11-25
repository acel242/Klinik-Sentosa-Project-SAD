import React, { createContext, useContext, useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';

const ClinicContext = createContext();

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
    const [searchQuery, setSearchQuery] = useState('');

    // Check for persisted login
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Fetch data
    const fetchData = async () => {
        try {
            const [
                { data: p },
                { data: q },
                { data: e },
                { data: pr },
                { data: t },
                { data: m }
            ] = await Promise.all([
                supabase.from('patients').select('*'),
                supabase.from('queue').select('*'),
                supabase.from('examinations').select('*'),
                supabase.from('prescriptions').select('*'),
                supabase.from('transactions').select('*'),
                supabase.from('medicines').select('*').order('name'),
            ]);

            if (p) setPatients(p);
            if (q) setQueue(q);
            if (e) setExaminations(e);
            if (pr) setPrescriptions(pr);
            if (t) setTransactions(t);
            if (m) setMedicines(m);
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
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password);

            if (error) throw error;

            if (users && users.length > 0) {
                const userData = users[0];
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Login error", error);
            throw error;
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
        const newPatient = { ...patientData, registeredAt: new Date().toISOString() };

        // 1. Add to Patients
        const { data: savedPatient, error: pError } = await supabase
            .from('patients')
            .insert([newPatient])
            .select()
            .single();

        if (pError) throw pError;

        // 2. Add to Queue
        const queueItem = {
            patientId: savedPatient.id,
            patientName: savedPatient.name,
            status: 'waiting',
            joinedAt: new Date().toISOString(),
        };

        const { error: qError } = await supabase.from('queue').insert([queueItem]);
        if (qError) throw qError;

        await fetchData(); // Refresh data
    };

    const updateQueueStatus = async (queueId, status) => {
        const { error } = await supabase
            .from('queue')
            .update({ status })
            .eq('id', queueId);

        if (error) throw error;
        await fetchData();
    };

    const addExamination = async (exam) => {
        const newExam = { ...exam, date: new Date().toISOString() };

        const { error } = await supabase.from('examinations').insert([newExam]);
        if (error) throw error;

        // Move patient to payment regardless of prescription
        const queueItem = queue.find(q => q.patientId === exam.patientId && q.status === 'examining');
        if (queueItem) {
            await updateQueueStatus(queueItem.id, 'payment');
        } else {
            await fetchData();
        }
    };

    const addPrescription = async (prescription) => {
        const newPrescription = { ...prescription, status: 'pending' };

        const { error } = await supabase.from('prescriptions').insert([newPrescription]);
        if (error) throw error;

        // Deduct stock
        for (const med of prescription.medicines) {
            const currentMed = medicines.find(m => m.id === med.id);
            if (currentMed) {
                const newStock = currentMed.stock - parseInt(med.amount);
                await updateMedicine(med.id, { stock: newStock });
            }
        }

        await fetchData();
    };

    const updatePrescriptionStatus = async (id, status) => {
        const { error } = await supabase
            .from('prescriptions')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        await fetchData();
    };

    const completePrescription = async (prescriptionId) => {
        await updatePrescriptionStatus(prescriptionId, 'completed');

        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (prescription) {
            const queueItem = queue.find(q => q.patientId === prescription.patientId && q.status === 'pharmacy');
            if (queueItem) {
                await updateQueueStatus(queueItem.id, 'completed');
            }
        }
    };

    const processPayment = async (payment) => {
        const newTransaction = { ...payment, date: new Date().toISOString() };

        const { error } = await supabase.from('transactions').insert([newTransaction]);
        if (error) throw error;

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
            await fetchData();
        }
    };

    // Medicine Actions
    const addMedicine = async (medicine) => {
        const { error } = await supabase.from('medicines').insert([medicine]);
        if (error) throw error;
        await fetchData();
    };

    const updateMedicine = async (id, updates) => {
        const { error } = await supabase
            .from('medicines')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        await fetchData();
    };

    const updateMedicineStock = async (id, newStock) => {
        await updateMedicine(id, { stock: newStock });
    };

    const deleteMedicine = async (id) => {
        const { error } = await supabase
            .from('medicines')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchData();
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
        updatePrescriptionStatus,
        completePrescription,
        processPayment,
        addMedicine,
        updateMedicine,
        updateMedicineStock,
        deleteMedicine
    };

    return (
        <ClinicContext.Provider value={value}>
            {children}
        </ClinicContext.Provider>
    );
};
