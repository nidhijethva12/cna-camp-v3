import type { MongooseAdapter } from "@payloadcms/db-mongodb";
import type { Payload } from "payload";

const GROUPS = ["0", "A", "B", "C", "D", "E"] as const;
const SOURCES = ["direct", "school", "ambassador"] as const;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface GroupStats {
  group: string;
  total: number;
  confirmed: number;
  pending: number;
}

export interface OlympiadStats {
  registered: number;
  paid: number;
  free: number;
  pending: number;
  collected: number;
  today: number;
  /** Start of today in India, as the ISO time the "Today" view filters from. */
  todayFrom: string;
  feeCheck: number;
  reminders: number;
  invited: number;
  groups: GroupStats[];
  districts: { name: string; count: number }[];
  sources: { source: string; count: number }[];
}

interface Bucket {
  _id: { type?: string; group?: string; paymentStatus?: string; district?: string; source?: string; feeCheck?: boolean; today?: boolean };
  count: number;
  fee: number;
}

/** Midnight in India for the current day, as a UTC instant. */
function startOfIndiaDay(now = new Date()) {
  const india = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), india.getUTCDate()) - IST_OFFSET_MS);
}

/** Counts behind the Olympiad overview in the admin, from one pass over the master list. */
export async function getOlympiadStats(payload: Payload): Promise<OlympiadStats> {
  const todayFrom = startOfIndiaDay();
  const model = (payload.db as MongooseAdapter).collections["olympiad-people"];
  const buckets = await model.aggregate<Bucket>([
    {
      $group: {
        _id: {
          type: "$type",
          group: "$group",
          paymentStatus: "$paymentStatus",
          district: "$district",
          source: "$source",
          feeCheck: { $eq: ["$feeCheck", true] },
          today: { $gte: [{ $ifNull: ["$registeredAt", "$createdAt"] }, todayFrom] },
        },
        count: { $sum: 1 },
        fee: { $sum: { $ifNull: ["$fee", 0] } },
      },
    },
  ]);

  const stats: OlympiadStats = {
    registered: 0,
    paid: 0,
    free: 0,
    pending: 0,
    collected: 0,
    today: 0,
    todayFrom: todayFrom.toISOString(),
    feeCheck: 0,
    reminders: 0,
    invited: 0,
    groups: GROUPS.map((group) => ({ group, total: 0, confirmed: 0, pending: 0 })),
    districts: [],
    sources: SOURCES.map((source) => ({ source, count: 0 })),
  };
  const districts = new Map<string, number>();

  for (const { _id: b, count, fee } of buckets) {
    if (b.type === "reminder") stats.reminders += count;
    if (b.type === "invited") stats.invited += count;
    if (b.type !== "registered") continue;

    const confirmed = b.paymentStatus === "paid" || b.paymentStatus === "free";
    stats.registered += count;
    if (b.paymentStatus === "paid") {
      stats.paid += count;
      stats.collected += fee;
    } else if (b.paymentStatus === "free") stats.free += count;
    else stats.pending += count;
    if (b.today) stats.today += count;
    if (b.feeCheck) stats.feeCheck += count;

    const group = stats.groups.find((g) => g.group === b.group);
    if (group) {
      group.total += count;
      if (confirmed) group.confirmed += count;
      else group.pending += count;
    }
    if (b.district) districts.set(b.district, (districts.get(b.district) ?? 0) + count);
    const source = stats.sources.find((s) => s.source === (b.source ?? "direct"));
    if (source) source.count += count;
  }

  stats.districts = [...districts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return stats;
}
