
-- Create storage bucket for announcement photos
INSERT INTO storage.buckets (id, name, public) VALUES ('anuncios', 'anuncios', true);

-- Allow authenticated users to upload to anuncios bucket
CREATE POLICY "Auth users can upload anuncio photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'anuncios');

-- Allow public read access
CREATE POLICY "Public can read anuncio photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'anuncios');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own anuncio photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'anuncios' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Auth users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
