-- ============================================================================
-- E-CMIS Activity 7 — database-backed notifications and per-user read receipts
-- Apply once in the Supabase SQL Editor before enabling database mode.
--
-- The current prototype signs in with sessionStorage demo role ids, not Supabase
-- Auth users. RLS therefore permits the publishable/anon role to access these two
-- tables while the application filters by recipient_id. This is suitable only for
-- the existing prototype. Production must replace these policies with auth.uid()
-- ownership checks and store recipient UUIDs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ecmis_notification_event (
  id              text PRIMARY KEY,
  event_key       text NOT NULL UNIQUE,
  type            text NOT NULL CHECK (type IN (
                    'AGENDA_PLACED', 'AGENDA_REMINDER',
                    'RESOLUTION_DISPATCHED', 'DISCIPLINE_SENT_ACTIVITY8',
                    'CASE_DEADLINE'
                  )),
  case_id         text NOT NULL,
  title           text NOT NULL,
  body            text NOT NULL DEFAULT '',
  href            text NOT NULL DEFAULT 'notifications.html',
  sender_id       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  scheduled_at    timestamptz,
  delivered_at    timestamptz NOT NULL DEFAULT now(),
  meeting_date    date,
  meeting_no      text,
  agenda_no       text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.ecmis_notification_recipient (
  notification_id text NOT NULL REFERENCES public.ecmis_notification_event(id) ON DELETE CASCADE,
  recipient_id     text NOT NULL,
  delivered_at     timestamptz NOT NULL DEFAULT now(),
  read_at          timestamptz,
  PRIMARY KEY (notification_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_ecmis_notification_event_case
  ON public.ecmis_notification_event (case_id, delivered_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecmis_notification_event_schedule
  ON public.ecmis_notification_event (type, meeting_date, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_ecmis_notification_recipient_unread
  ON public.ecmis_notification_recipient (recipient_id, delivered_at DESC)
  WHERE read_at IS NULL;

COMMENT ON TABLE public.ecmis_notification_event IS
  'One immutable business notification per unique event_key.';

COMMENT ON TABLE public.ecmis_notification_recipient IS
  'Delivery and first-read receipt for one recipient of a notification event.';

-- A read receipt is evidence. Once captured, later updates must not rewrite it.
CREATE OR REPLACE FUNCTION public.ecmis_preserve_first_notification_read_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.read_at IS NOT NULL THEN
    NEW.read_at := OLD.read_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ecmis_preserve_first_notification_read_at
  ON public.ecmis_notification_recipient;

CREATE TRIGGER trg_ecmis_preserve_first_notification_read_at
BEFORE UPDATE OF read_at ON public.ecmis_notification_recipient
FOR EACH ROW EXECUTE FUNCTION public.ecmis_preserve_first_notification_read_at();

ALTER TABLE public.ecmis_notification_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecmis_notification_recipient ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.ecmis_notification_event TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE (read_at) ON public.ecmis_notification_recipient TO anon, authenticated;

DROP POLICY IF EXISTS ecmis_notification_event_demo_select ON public.ecmis_notification_event;
CREATE POLICY ecmis_notification_event_demo_select
  ON public.ecmis_notification_event FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS ecmis_notification_event_demo_insert ON public.ecmis_notification_event;
CREATE POLICY ecmis_notification_event_demo_insert
  ON public.ecmis_notification_event FOR INSERT
  TO anon, authenticated
  WITH CHECK (event_key <> '' AND case_id <> '');

DROP POLICY IF EXISTS ecmis_notification_recipient_demo_select ON public.ecmis_notification_recipient;
CREATE POLICY ecmis_notification_recipient_demo_select
  ON public.ecmis_notification_recipient FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS ecmis_notification_recipient_demo_insert ON public.ecmis_notification_recipient;
CREATE POLICY ecmis_notification_recipient_demo_insert
  ON public.ecmis_notification_recipient FOR INSERT
  TO anon, authenticated
  WITH CHECK (recipient_id <> '');

DROP POLICY IF EXISTS ecmis_notification_recipient_demo_update ON public.ecmis_notification_recipient;
CREATE POLICY ecmis_notification_recipient_demo_update
  ON public.ecmis_notification_recipient FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (recipient_id <> '');

-- Verification queries after applying this migration:
-- SELECT event_key, type, case_id, delivered_at FROM public.ecmis_notification_event ORDER BY delivered_at DESC;
-- SELECT notification_id, recipient_id, read_at FROM public.ecmis_notification_recipient ORDER BY delivered_at DESC;
