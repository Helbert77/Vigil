-- Função para incrementar shares_count de anúncios
CREATE OR REPLACE FUNCTION increment_ad_shares(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ads 
  SET shares_count = shares_count + 1 
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

