import { createClient } from '../../../../../lib/supabase/server';
import ChecklistSection from './ChecklistSection';

export default async function ChecklistPage({ params }) {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('trip_checklist')
    .select('*')
    .eq('trip_id', params.id)
    .order('created_at', { ascending: true });

  return <ChecklistSection tripId={params.id} initialItems={items ?? []} />;
}
