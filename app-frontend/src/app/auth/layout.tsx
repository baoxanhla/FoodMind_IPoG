// app-frontend/src/app/auth/layout.tsx
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        {children}
      </div>
    </div>
  );
}