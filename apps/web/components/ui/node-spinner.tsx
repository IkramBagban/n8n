import { cn } from '@/lib/utils';

interface NodeSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function NodeSpinner({ size = 'md', className }: NodeSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6', 
        lg: 'w-8 h-8'
    };

    return (
        <div className={cn('relative', sizeClasses[size], className)}>
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
            
            <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 border-r-orange-300 rounded-full animate-spin"></div>

            <div className="absolute inset-1 bg-white rounded-full border border-gray-100"></div>
        </div>
    );
}

export function NodeExecutionIndicator({ 
    status, 
    size = 'md', 
    className 
}: { 
    status: 'idle' | 'executing' | 'success' | 'failed';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    if (status === 'executing') {
        return <NodeSpinner size={size} className={className} />;
    }

    if (status === 'success') {
        return (
            <div className={cn(
                'flex items-center justify-center rounded-full bg-green-500',
                sizeClasses[size],
                className
            )}>
                <svg 
                    className="w-1/2 h-1/2 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                    />
                </svg>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className={cn(
                'flex items-center justify-center rounded-full bg-red-500',
                sizeClasses[size],
                className
            )}>
                <svg 
                    className="w-1/2 h-1/2 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M6 18L18 6M6 6l12 12" 
                    />
                </svg>
            </div>
        );
    }

    return null;
}