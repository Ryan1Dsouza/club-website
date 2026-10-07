import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://diqzjvlcowxhbzrvplqb.supabase.co";
const supabaseAnonKey = "sb_publishable_NVP5s5fJMyLrAJVZvK0F5w_CbOcbEru";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export {
  supabase
};
