import { twMerge } from 'tailwind-merge';

export const Input = ({ label, error, className, icon: Icon, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-secondary-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={twMerge(
                        "w-full px-3 py-2.5 bg-white border rounded-lg text-secondary-900 placeholder-secondary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500",
                        Icon && "pl-10",
                        error ? "border-red-300 focus:ring-red-100 focus:border-red-500" : "border-secondary-300",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 animate-pulse">{error}</p>
            )}
        </div>
    );
};
