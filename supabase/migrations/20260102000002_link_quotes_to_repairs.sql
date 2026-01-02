-- Migration: Link quotes to repairs and allow public access for tracking
-- Date: 2026-01-02

-- Link quotes to repairs
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS repair_id UUID REFERENCES public.repairs(id) ON DELETE SET NULL;

-- Public access policies for quotes linked to a repair
CREATE POLICY "Public can view quotes linked to a repair"
    ON public.quotes FOR SELECT
    TO anon, authenticated
    USING (repair_id IS NOT NULL);

CREATE POLICY "Public can view quote items for linked quotes"
    ON public.quote_items FOR SELECT
    TO anon, authenticated
    USING (quote_id IN (SELECT id FROM public.quotes WHERE repair_id IS NOT NULL));

-- Allow public to update quote status (Accept/Reject)
CREATE POLICY "Public can accept or reject their quotes"
    ON public.quotes FOR UPDATE
    TO anon, authenticated
    USING (repair_id IS NOT NULL)
    WITH CHECK (status IN ('accepted', 'rejected'));

-- Public access policies for invoices linked to a repair
CREATE POLICY "Public can view invoices linked to a repair"
    ON public.invoices FOR SELECT
    TO anon, authenticated
    USING (repair_id IS NOT NULL);

CREATE POLICY "Public can view invoice items for linked invoices"
    ON public.invoice_items FOR SELECT
    TO anon, authenticated
    USING (invoice_id IN (SELECT id FROM public.invoices WHERE repair_id IS NOT NULL));
