ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS abilities jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS weapon_type text NOT NULL DEFAULT '';
ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS weapon_dice text NOT NULL DEFAULT '';
ALTER TABLE public.sheets ADD COLUMN IF NOT EXISTS initiative int;
ALTER TABLE public.npcs ADD COLUMN IF NOT EXISTS initiative int;
ALTER FUNCTION public.set_campaign_password(uuid,text) SET search_path = public, extensions;
ALTER FUNCTION public.join_campaign(text,text) SET search_path = public, extensions;
CREATE OR REPLACE FUNCTION public.is_master_of_sheet(p_sheet uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.campaign_members m JOIN public.campaigns c ON c.id=m.campaign_id WHERE m.character_id=p_sheet AND c.master_id=auth.uid()) $$;
REVOKE ALL ON FUNCTION public.is_master_of_sheet(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_master_of_sheet(uuid) TO authenticated;
CREATE POLICY "Master reads member sheets" ON public.sheets FOR SELECT TO authenticated USING (public.is_master_of_sheet(id));
CREATE OR REPLACE FUNCTION public.master_update_sheet(p_sheet uuid, p_pv int, p_pf int, p_clear_initiative boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_master_of_sheet(p_sheet) THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  UPDATE public.sheets SET
    pv_current = CASE WHEN p_pv IS NULL THEN pv_current ELSE GREATEST(0, LEAST(pv_max, p_pv)) END,
    pf_current = CASE WHEN p_pf IS NULL THEN pf_current ELSE GREATEST(0, LEAST(pf_max, p_pf)) END,
    initiative = CASE WHEN p_clear_initiative THEN NULL ELSE initiative END
  WHERE id = p_sheet;
END; $$;
REVOKE ALL ON FUNCTION public.master_update_sheet(uuid,int,int,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.master_update_sheet(uuid,int,int,boolean) TO authenticated;