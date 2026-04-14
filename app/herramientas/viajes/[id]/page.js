import { createClient } from '../../../../lib/supabase/server';
import ItinerarioSection from './itinerario/ItinerarioSection';

export default async function TripPage({ params }) {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('trip_itinerary')
    .select('*')
    .eq('trip_id', params.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: false });

  return <ItinerarioSection tripId={params.id} initialItems={items ?? []} />;
}
