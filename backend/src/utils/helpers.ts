export function calculateExpiry(val: boolean) {
  return val
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) //30 days
    : new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours
}
