import type { AmbassadorDoc, SchoolDoc } from './schemas.js';
import { setPasswordUrl } from './services/notify.service.js';
import { createToken, DAY } from './tokens.js';

const LINK_DAYS = 7;

/** Changes whenever the password is set, so links and sessions made before it stop working. */
export const passwordVersion = (partner: {
  login?: { passwordSetAt?: Date | null };
}) => String(partner.login?.passwordSetAt?.getTime() ?? 0);

/**
 * A one-time "choose your password" link for an approved partner. It carries the time the password
 * was last set, so it stops working as soon as any password is set.
 */
export const passwordLinkFor = (
  kind: 'school' | 'ambassador',
  partner: SchoolDoc | AmbassadorDoc,
) =>
  setPasswordUrl(
    createToken(
      'password',
      String(partner._id),
      LINK_DAYS * DAY,
      kind,
      passwordVersion(partner),
    ),
  );
