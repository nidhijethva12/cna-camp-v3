/**
 * Request context for Payload calls made from scripts (seed, migrations), which run outside Next.js
 * and so have no cache to revalidate. Returns a fresh object per call: the storage plugin flags the
 * context mid-upload, and a shared object keeps that flag, so every later upload would silently skip
 * Vercel Blob.
 */
export const scriptContext = () => ({ skipRevalidate: true });
