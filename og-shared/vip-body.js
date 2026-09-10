// The VIP cover, shared by /vip and /vip/<code>. The code itself never reaches
// the tags — a preview card is public, and a VIP code in it would be a code
// handed to the whole channel.
export const vipMeta = (url) => ({
  title: 'Activate your VIP access',
  description: 'Tap to open the code box — then every mock, transcript and AI report is unlocked.',
  image: `${url.origin}/og/vip.png`,
});
