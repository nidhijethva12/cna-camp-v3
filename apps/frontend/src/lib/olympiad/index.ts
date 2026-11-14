/**
 * The Olympiad API (apps/backend) is connected. Until it is, the Olympiad page sends people to the
 * contact form instead of its own forms, and the pages that need the API (registration, dashboards,
 * payment and consent links) stay off.
 */
export const olympiadApiLive = Boolean(process.env.BACKEND_URL && process.env.BACKEND_API_KEY);
