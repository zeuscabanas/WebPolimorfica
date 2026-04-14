import { createClient } from '../../../../../lib/supabase/server';
import GastosSection from './GastosSection';

export default async function GastosPage({ params }) {
  const supabase = createClient();
  const { data: expenses } = await supabase
    .from('trip_expenses')
    .select('*')
    .eq('trip_id', params.id)
    .order('date', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  return <GastosSection tripId={params.id} initialExpenses={expenses ?? []} userId={user?.id} />;
}
