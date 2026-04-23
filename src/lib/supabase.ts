import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cumfqydfqcfdjgbtumrs.supabase.co';
const supabaseAnonKey = 'sb_publishable_xiYduJKR1MTLgrqLxiFH8A_U8Spi4i7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
