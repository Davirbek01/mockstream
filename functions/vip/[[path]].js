// og-vip — /vip/<code>. Same card as the bare /vip on purpose: the code is in
// the URL, and must not be in the preview a whole channel can read.
import { withOg } from '../../og-shared/inject.js';
import { vipMeta } from '../../og-shared/vip-body.js';

export const onRequest = (context) => withOg(context, vipMeta);
