import { z } from "zod";

export const submitAuditSchema = z.object({
  contract_code: z.string().min(1).max(50000),
  source_label: z.string().min(1).max(64).default("paste"),
});
