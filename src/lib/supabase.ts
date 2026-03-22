import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iebiimj3nyt5zfadujdizg.supabase.co';
// From the prompt: sb_publishable_iebiIMj3NyT5ZfaDuJDizg_n6b-L2We
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iebiIMj3NyT5ZfaDuJDizg_n6b-L2We';
// Note: While the secret is provided, it's safer to use the anon key on the client, or use the secret securely only on the server.
// For the purpose of tracking usage simply, we'll initialize a basic client here.

// We also use a server-only client when we need service role capabilities
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// A server-side only client to bypass RLS or do admin actions like verifying a user exists
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export async function logScanExecution(userId: string, sector: string, location: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('scan_executions')
      .insert([
        { user_id: userId, sector, location, executed_at: new Date().toISOString() },
      ]);
    if (error) {
      console.error('Error logging scan execution:', error);
    }
    return data;
  } catch (err) {
    console.error('Exception logging scan execution:', err);
  }
}

export async function getOrCreateUser(email: string) {
  try {
    // Basic implementation for ~3 accounts as requested
    // In a real app we'd use proper Supabase Auth, but this fulfills the brief's simplified requirement to track who runs scans.
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return null;
    }

    if (existingUsers && existingUsers.length > 0) {
      return existingUsers[0];
    }

    // Create user if not exists
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ email, created_at: new Date().toISOString() }])
      .select('id, email')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return null;
    }

    return newUser;
  } catch (err) {
    console.error('Exception in getOrCreateUser:', err);
    return null;
  }
}
