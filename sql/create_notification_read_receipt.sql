-- Read receipts for the existing header notification dropdown only.
-- Notification delivery remains outside this prototype (LINE integration).

CREATE TABLE IF NOT EXISTS public.ecmis_notification_read_receipt (
  notification_id text NOT NULL,
  user_id         text NOT NULL,
  read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ecmis_notification_read_receipt_user
  ON public.ecmis_notification_read_receipt (user_id, read_at DESC);

ALTER TABLE public.ecmis_notification_read_receipt ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.ecmis_notification_read_receipt TO anon, authenticated;

DROP POLICY IF EXISTS ecmis_notification_read_receipt_demo_select
  ON public.ecmis_notification_read_receipt;
CREATE POLICY ecmis_notification_read_receipt_demo_select
  ON public.ecmis_notification_read_receipt FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS ecmis_notification_read_receipt_demo_insert
  ON public.ecmis_notification_read_receipt;
CREATE POLICY ecmis_notification_read_receipt_demo_insert
  ON public.ecmis_notification_read_receipt FOR INSERT
  TO anon, authenticated
  WITH CHECK (notification_id <> '' AND user_id <> '');

CREATE OR REPLACE FUNCTION public.ecmis_record_notification_read(
  p_notification_id text,
  p_user_id text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  first_read_at timestamptz;
BEGIN
  IF coalesce(p_notification_id, '') = '' OR coalesce(p_user_id, '') = '' THEN
    RAISE EXCEPTION 'notification_id and user_id are required';
  END IF;

  INSERT INTO public.ecmis_notification_read_receipt (notification_id, user_id)
  VALUES (p_notification_id, p_user_id)
  ON CONFLICT (notification_id, user_id) DO NOTHING;

  SELECT read_at INTO first_read_at
  FROM public.ecmis_notification_read_receipt
  WHERE notification_id = p_notification_id AND user_id = p_user_id;

  RETURN first_read_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ecmis_record_notification_read(text, text)
  TO anon, authenticated;
