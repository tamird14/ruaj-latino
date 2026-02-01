import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const Loading = ({ size = 'medium', text }: LoadingProps) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizes[size]} text-primary-500 animate-spin`} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-dark-950/80 flex items-center justify-center z-50">
      <Loading size="large" />
    </div>
  );
};
