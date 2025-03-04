-- Create the favorites table
CREATE TABLE country_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE country_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy for reading data
CREATE POLICY "Users can read own favorites"
ON country_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for inserting data
CREATE POLICY "Users can insert own favorites"
ON country_favorites
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
);

-- Create policy for deleting data
CREATE POLICY "Users can delete own favorites"
ON country_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to automatically set user_id
CREATE OR REPLACE FUNCTION set_favorite_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS set_favorite_user_id_trigger ON country_favorites;
CREATE TRIGGER set_favorite_user_id_trigger
BEFORE INSERT ON country_favorites
FOR EACH ROW
EXECUTE FUNCTION set_favorite_user_id(); 