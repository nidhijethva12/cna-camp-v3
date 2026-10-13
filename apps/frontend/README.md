# CNA Camp: frontend and CMS

Next.js 16 site with Payload CMS 3 (admin at `/admin`). Setup, environment variables and deployment are in the [root README](../../README.md).

| Command                              | What it does                                                            |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `npm run dev`                        | Local site at http://localhost:3000                                     |
| `npm run typecheck` / `npm run lint` | The checks CI runs on every push                                        |
| `npm run build`                      | Production build (needs the database in `.env`)                         |
| `npm run generate:types`             | Regenerate `src/payload-types.ts` after changing a collection or global |
| `npm run seed`                       | Fill an empty database with the design content                          |
