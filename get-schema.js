const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableSchema() {
  try {
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'queues' });

    if (error) {
      console.error('Error fetching schema:', error);
      return;
    }

    console.log('Queues table schema:', data);
  } catch (err) {
    console.error('Execution error:', err);
  }
}

// Alternative approach - query actual rows to see column names
async function queryTableSample() {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying table:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Queue table columns:', Object.keys(data[0]));
    } else {
      console.log('No rows found in the queues table');
    }
  } catch (err) {
    console.error('Execution error:', err);
  }
}

// Try both approaches
getTableSchema().catch(console.error);
queryTableSample().catch(console.error);
