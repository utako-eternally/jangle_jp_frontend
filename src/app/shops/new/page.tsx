// src/app/shops/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import ShopForm from '../components/ShopForm';

export default function NewShopPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/shops');
  };

  const handleCancel = () => {
    router.push('/dashboard/shops');
  };

  return (
    <ShopForm
      mode="create"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}