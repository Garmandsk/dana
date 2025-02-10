const supabase = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = process.env;

const db = supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

console.log("Database Terhubung");

module.exports = db;