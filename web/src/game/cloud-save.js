import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zgnynafgekvkglsspird.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FjFkD0VKr5vx-aHrAhhCIA_b1JnwCxO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function getCloudSave() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('baseball_game_saves')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function putCloudSave(save) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { synced: false, reason: 'not_authenticated' };
  const payload = {
    user_id: user.id,
    currency: Number(save.currency ?? 0),
    collection: save.collection ?? [],
    team: save.team ?? [],
    progress: save.progress ?? {},
    settings: save.settings ?? {},
    matches: Number(save.matches ?? 0),
    wins: Number(save.wins ?? 0),
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase
    .from('baseball_game_saves')
    .upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
  return { synced: true };
}

export async function signInWithMagicLink(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href }
  });
}

export async function signOutCloud() {
  return supabase.auth.signOut();
}

export async function getCloudUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}
