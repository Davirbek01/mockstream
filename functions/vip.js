// og-vip — /vip (the bare form: opens the code box, empty).
import { withOg } from '../og-shared/inject.js';
import { vipMeta } from '../og-shared/vip-body.js';

export const onRequest = (context) => withOg(context, vipMeta);
