-- Criar bucket para arquivos da biblioteca
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-media', 'library-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket library-media

-- Permitir que qualquer pessoa autenticada faça upload
CREATE POLICY "Authenticated users can upload library files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'library-media');

-- Permitir que qualquer pessoa visualize arquivos públicos
CREATE POLICY "Public can view library files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'library-media');

-- Permitir que admins e moderadores atualizem arquivos
CREATE POLICY "Admins and moderators can update library files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'library-media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- Permitir que admins e moderadores excluam arquivos
CREATE POLICY "Admins and moderators can delete library files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'library-media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);

