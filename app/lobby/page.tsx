import { Suspense } from 'react';
import LobbyScreen from '@/components/screens/LobbyScreen';

export default function LobbyPage() {
  return (
    <Suspense>
      <LobbyScreen />
    </Suspense>
  );
}
