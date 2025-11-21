import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, ArrowRight, Activity } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useClinic();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const user = await login(formData.username, formData.password);
            if (user) {
                navigate(`/${user.role}/dashboard`);
            } else {
                setError('Username atau password salah');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl animate-fade-in"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-3xl animate-fade-in" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-4 shadow-lg shadow-primary-500/30">
                            <Activity size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Klinik Sentosa</h1>
                        <p className="text-secondary-500 text-sm">Masuk untuk mengakses dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Username"
                                name="username"
                                type="text"
                                placeholder="Masukkan username"
                                value={formData.username}
                                onChange={handleChange}
                                icon={User}
                                error={error && !formData.username ? 'Username harus diisi' : ''}
                            />
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Masukkan password"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                error={error && !formData.password ? 'Password harus diisi' : ''}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-secondary-100">
                        <p className="text-xs text-center text-secondary-500 mb-4">
                            Gunakan akun demo berikut:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setFormData({ username: 'admin', password: '123' })}
                                className="p-2 text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-600 rounded-lg border border-secondary-200 transition-colors"
                            >
                                Admin
                            </button>
                            <button
                                onClick={() => setFormData({ username: 'doctor', password: '123' })}
                                className="p-2 text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-600 rounded-lg border border-secondary-200 transition-colors"
                            >
                                Dokter
                            </button>
                            <button
                                onClick={() => setFormData({ username: 'pharmacy', password: '123' })}
                                className="p-2 text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-600 rounded-lg border border-secondary-200 transition-colors"
                            >
                                Apotek
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-secondary-400 mt-8">
                    &copy; 2025 Klinik Sentosa. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
