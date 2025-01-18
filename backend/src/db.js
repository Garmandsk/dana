const supabase = require('@supabase/supabase-js');

SUPABASE_URL = "https://ixuxnlpzcxdmtzferxhx.supabase.co";
SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXhubHB6Y3hkbXR6ZmVyeGh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTY2NzQ0MiwiZXhwIjoyMDQ1MjQzNDQyfQ.xkDifKAqdFLdT-RS6_0RTSAz1SM5oqYzodPhu8Jy5d8";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

console.log(db);

module.exports = db;