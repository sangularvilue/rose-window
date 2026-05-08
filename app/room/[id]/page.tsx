import GameRoom from '@/components/screens/GameRoom';

export default function RoomPage({ params }: { params: { id: string } }) {
  return <GameRoom roomId={params.id} />;
}
