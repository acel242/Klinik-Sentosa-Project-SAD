import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, title, ...props }) => {
    return (
        <div className={twMerge("bg-white rounded-xl shadow-card border border-secondary-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)} {...props}>
            {title && (
                <div className="mb-5 pb-3 border-b border-secondary-100">
                    <h3 className="text-lg font-semibold text-secondary-900">
                        {title}
                    </h3>
                </div>
            )}
            {children}
        </div>
    );
};
