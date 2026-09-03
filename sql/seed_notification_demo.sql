-- Demo notification for validating the four notification recipient accounts.
-- Prerequisite: run sql/create_notification_store.sql first.

INSERT INTO public.ecmis_notification_event (
  id, event_key, type, case_id, title, body, href, sender_id,
  created_at, delivered_at, meeting_date, meeting_no, agenda_no, metadata
) VALUES (
  'notif-demo-agenda-1311-2566',
  'demo:agenda-placed:1311/2566',
  'AGENDA_PLACED',
  '1311/2566',
  'บรรจุวาระการประชุมแล้ว',
  'สำนวน 1311/2566 ได้รับการบรรจุวาระแล้ว (ข้อมูลสาธิตจากฐานข้อมูล)',
  'notifications.html',
  'affairs',
  now(),
  now(),
  DATE '2026-09-07',
  '37/2569',
  '5.2',
  '{"demo":true}'::jsonb
)
ON CONFLICT (event_key) DO NOTHING;

INSERT INTO public.ecmis_notification_recipient (
  notification_id, recipient_id, delivered_at
) SELECT event.id, recipient.recipient_id, now()
FROM public.ecmis_notification_event AS event
CROSS JOIN (VALUES
  ('investigator_demo'),
  ('director_demo'),
  ('case_clerk_demo')
) AS recipient(recipient_id)
WHERE event.event_key = 'demo:agenda-placed:1311/2566'
ON CONFLICT (notification_id, recipient_id) DO NOTHING;

-- Expected:
-- Somchai.I, Narin.D and Kanda.C each see one unread notification.
-- Suda.T does not see this AGENDA_PLACED notification.
