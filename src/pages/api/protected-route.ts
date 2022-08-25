import {
    withApiAuth,
    supabaseServerClient
  } from '@supabase/auth-helpers-nextjs';
  
  export default withApiAuth(async function ProtectedRoute(req, res) {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient({ req, res })
      .from('json')
      .select('*');
    res.json(data);
  });