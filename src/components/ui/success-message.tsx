// src/components/ui/success-message.tsx
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-green-50 border border-green-200 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      </div>
    </div>
  );
}