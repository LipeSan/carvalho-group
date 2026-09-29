import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs, type Job } from "@/db/schema";

export async function getJobForAdmin(id: number): Promise<Job | null> {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return job ?? null;
}
