import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    Activity,
    Pill,
    Stethoscope,
    CreditCard,
    FileText,
    UserPlus
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const Layout = () => {
    const { user, logout, queue } = useClinic();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const getNavItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    {
                        title: 'Menu Utama',
                        items: [
                            { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }
                        ]
                    },
                    {
                        title: 'Aksi Cepat',
                        items: [
                            { path: '/admin/registration', label: 'Pendaftaran', icon: UserPlus },
                            { path: '/admin/queue', label: 'Antrian', icon: Users },
                            { path: '/admin/payment', label: 'Pembayaran', icon: CreditCard }
                        ]
                    },
                    {
                        title: 'Laporan',
                        items: [
                            { path: '/admin/transactions', label: 'Laporan', icon: FileText }
                        ]
                    }
                ];
            case 'doctor':
                // Find active examination
                const activeExam = queue?.find(q => q.status === 'examining');
                const examPath = activeExam ? `/doctor/examination/${activeExam.id}` : '/doctor/examination';

                return [
                    {
                        title: 'Menu Utama',
                        items: [
                            { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { path: examPath, label: 'Pemeriksaan', icon: Stethoscope },
                            { path: '/doctor/history', label: 'Riwayat Pasien', icon: Calendar },
                        ]
                    }
                ];
            case 'pharmacy':
                return [
                    {
                        title: 'Menu Utama',
                        items: [
                            { path: '/pharmacy/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { path: '/pharmacy/prescription', label: 'Resep', icon: Pill },
                            { path: '/pharmacy/inventory', label: 'Stok Obat', icon: Activity },
                        ]
                    }
                ];
            default:
                return [];
        }
    };

    const NavItem = ({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
            <Link
                to={path}
                className={twMerge(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                    isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                )}
            >
                <Icon size={18} className={isActive ? "text-primary-600" : "text-secondary-400"} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-secondary-50">
            {/* Sidebar */}
            <aside
                className={twMerge(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 lg:relative lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full lg:hidden"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-secondary-100">
                    <div className="flex items-center gap-2 text-primary-600">
                        <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                            <Activity size={20} />
                        </div>
                        <span className="font-bold text-lg text-secondary-900">Klinik Sentosa</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto lg:hidden text-secondary-400 hover:text-secondary-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {getNavItems().map((group, index) => (
                        <div key={index}>
                            <div className="mb-2 px-3">
                                <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">{group.title}</p>
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <NavItem key={item.path} {...item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-100 bg-secondary-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden text-secondary-500 hover:text-secondary-700"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1 max-w-xl mx-4 lg:mx-0">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                            <input
                                type="text"
                                placeholder="Cari pasien, dokter, atau obat..."
                                className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-secondary-200 mx-2"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-secondary-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-secondary-500 capitalize">{user?.role || 'Role'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
