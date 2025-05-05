import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cors settings
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration incomplete');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Query all news or specific item if id is provided
    const { id } = req.query;
    let query = supabaseAdmin.from('news').select('*').order('created_at', { ascending: false });
    
    if (id) {
      query = query.eq('id', id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    // Return the data
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
    
  } catch (error: any) {
    console.error('Error in debug-news API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
