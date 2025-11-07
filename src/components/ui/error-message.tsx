// src/components/ui/error-message.tsx
import { XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{message}</p>
        </div>
      </div>
    </div>
  );
}