import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
                    {
                        'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30': variant === 'primary',
                        'bg-white text-neutral-800 hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md': variant === 'secondary',
                        'border-2 border-primary text-primary hover:bg-primary/5': variant === 'outline',
                        'text-neutral-600 hover:text-primary hover:bg-primary/5': variant === 'ghost',
                        'glass text-primary hover:bg-white/80 shadow-glass': variant === 'glass',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-12 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
