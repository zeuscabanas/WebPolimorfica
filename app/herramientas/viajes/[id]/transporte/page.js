import { createClient } from '../../../../../lib/supabase/server';
import TransporteSection from './TransporteSection';

export default async function TransportePage({ params }) {
  const supabase = createClient();
  const { data: transport } = await supabase
    .from('trip_transport')
    .select('*')
    .eq('trip_id', params.id)
    .order('departure_at', { ascending: true });

  return <TransporteSection tripId={params.id} initialTransport={transport ?? []} />;
}
