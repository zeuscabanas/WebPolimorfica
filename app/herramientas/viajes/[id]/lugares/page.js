import { createClient } from '../../../../../lib/supabase/server';
import LugaresSection from './LugaresSection';

export default async function LugaresPage({ params }) {
  const supabase = createClient();
  const { data: places } = await supabase
    .from('trip_places')
    .select('*')
    .eq('trip_id', params.id)
    .order('created_at', { ascending: true });

  return <LugaresSection tripId={params.id} initialPlaces={places ?? []} />;
}
