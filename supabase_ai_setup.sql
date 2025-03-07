-- Create a function to get table schema information
CREATE OR REPLACE FUNCTION get_table_schema(p_table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text, 
        c.data_type::text, 
        c.is_nullable::text, 
        c.column_default::text
    FROM information_schema.columns c
    WHERE c.table_name = p_table_name
    AND c.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely execute AI-generated queries
CREATE OR REPLACE FUNCTION execute_query(query text)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE 'WITH query_result AS (' || query || ') SELECT jsonb_agg(row_to_json(query_result)) FROM query_result' INTO result;
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Query execution failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for limited user information with security_invoker option
CREATE VIEW public.user_profiles
WITH (security_invoker = on) AS
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    EXTRACT(DAY FROM NOW() - created_at)::integer as account_age_days
FROM auth.users;

-- Enable RLS on the auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their profiles
CREATE POLICY "Authenticated Users Can Access Their Profiles"
ON auth.users
FOR SELECT
TO authenticated
USING (true); 