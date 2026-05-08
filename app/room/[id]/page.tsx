import GameRoom from '@/components/screens/GameRoom';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameRoom roomId={id} />;
}
