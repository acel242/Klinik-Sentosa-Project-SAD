import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'default', className, ...props }) => {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

    const variants = {
        default: "bg-secondary-50 text-secondary-700 border-secondary-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        info: "bg-primary-50 text-primary-700 border-primary-200",
    };

    return (
        <span
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </span>
    );
};
