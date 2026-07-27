import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://komadaobcalxqcbygmal.supabase.co"

const supabaseKey = "sb_publishable_0ggxQ_cvnbUM_VOoPbEOog_jywRyJ-D"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
