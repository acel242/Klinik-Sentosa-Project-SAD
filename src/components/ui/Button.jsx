import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400 shadow-sm hover:shadow",
        secondary: "bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50 hover:text-secondary-900 focus:ring-secondary-400 shadow-sm",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm",
        ghost: "bg-transparent text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 focus:ring-secondary-400",
        outline: "bg-transparent border border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-400",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};
