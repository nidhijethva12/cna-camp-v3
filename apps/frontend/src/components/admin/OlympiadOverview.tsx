import type { Payload } from "payload";
import { roleOf } from "@/cms/access";
import { getOlympiadStats } from "@/lib/olympiad/adminStats";
import { OlympiadViews } from "./OlympiadViews";

interface Props {
  payload: Payload;
  user?: unknown;
  /** On the admin home page: totals and groups only, under a heading. */
  compact?: boolean;
}

/** Registration totals with one-click filters, above the Olympiad master list and on the admin home page. */
export async function OlympiadOverview({ payload, user, compact = false }: Props) {
  const role = roleOf(user);
  if (role !== "admin" && role !== "editor") return null;
  const stats = await getOlympiadStats(payload).catch((err) => {
    payload.logger.error({ err }, "[olympiad] overview counts failed");
    return null;
  });
  if (!stats) return null;
  return <OlympiadViews stats={stats} compact={compact} />;
}
