// src/components/ui/info-message.tsx
import { Info } from 'lucide-react';

interface InfoMessageProps {
  message: string;
  title?: string;
}

export function InfoMessage({ message, title }: InfoMessageProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3">
          {title && (
            <p className="text-sm font-medium text-blue-800 mb-1">{title}</p>
          )}
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  );
}