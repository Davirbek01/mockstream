-- News-bot admin chat: stores the Telegram numeric chat_id of the admin
-- so generate-channel-post can DM each draft for tap-to-approve.
--
-- Revert: ALTER TABLE public.channel_post_settings DROP COLUMN admin_chat_id;

ALTER TABLE public.channel_post_settings
  ADD COLUMN IF NOT EXISTS admin_chat_id BIGINT;

-- Add a column on channel_posts to remember the Telegram message_id of the
-- draft we DM'd to the admin — so on Approve/Reject we can edit that message
-- in-place to remove the buttons and show the status.
ALTER TABLE public.channel_posts
  ADD COLUMN IF NOT EXISTS admin_draft_message_id BIGINT;
