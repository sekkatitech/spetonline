// Apple is sold to businesses, so buying and quoting need an enterprise account. New
// businesses can use Apple while their application is reviewed; approval still controls
// the wider enterprise area.

interface AccessProfile {
  role?: string | null
  enterprise_status?: string | null
}

export function canUseApple(profile: AccessProfile | null | undefined) {
  if (!profile) return false
  if (profile.role === 'admin' || profile.role === 'super_admin') return true
  return profile.enterprise_status === 'approved' || profile.enterprise_status === 'pending'
}

/** The wider enterprise catalogue stays with approved businesses only. */
export function canUseEnterprise(profile: AccessProfile | null | undefined) {
  if (!profile) return false
  return profile.role === 'admin' || profile.role === 'super_admin' || profile.enterprise_status === 'approved'
}

/** Only Apple pages are accepted, so a crafted link can't send someone elsewhere after login. */
export function appleReturnPath(search: string) {
  const path = new URLSearchParams(search).get('redirect')
  return path && /^\/enterprise\/apple(\/|\?|$)/.test(path) ? path : null
}

export const withAppleReturn = (page: string, returnPath: string | null) =>
  returnPath ? `${page}?redirect=${encodeURIComponent(returnPath)}` : page
