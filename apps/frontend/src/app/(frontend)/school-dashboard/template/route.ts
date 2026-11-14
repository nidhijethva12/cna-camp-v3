import { buildTemplate } from "@/lib/olympiad/studentSheet";

/** "Download template" on the school dashboard. */
export async function GET() {
  const file = await buildTemplate();
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="olympiad-students-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
