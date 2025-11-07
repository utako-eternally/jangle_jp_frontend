// src/components/ui/warning-message.tsx
import { AlertTriangle } from 'lucide-react';

interface WarningMessageProps {
  message: string;
  title?: string;
}

export function WarningMessage({ message, title }: WarningMessageProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="ml-3">
          {title && (
            <p className="text-sm font-medium text-yellow-800 mb-1">{title}</p>
          )}
          <p className="text-sm text-yellow-700">{message}</p>
        </div>
      </div>
    </div>
  );
}