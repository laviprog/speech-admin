import { admins, apiKeys, transcriptionTasks, users } from '@/lib/db/schema';
import { and, desc, eq, gte, isNull, lte, SQL, sql } from 'drizzle-orm';
import { database } from '.';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

export async function get_admin(email: string) {
  const [admin] = await database.select().from(admins).where(eq(admins.email, email));
  return admin;
}

export async function create_admin(email: string, password: string) {
  const now = new Date();
  const hash = await argon2.hash(password);
  await database.insert(admins).values({
    id: randomUUID(),
    email: email,
    password: hash,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    saOrmSentinel: null,
  });
}

export async function getUsersWithStats() {
  return database
    .select({
      id: users.id,
      companyName: users.companyName,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      apiKeysCount: sql<number>`count(distinct ${apiKeys.id})`,
      totalRequests: sql<number>`count(${transcriptionTasks.id})`,
      totalDurationSeconds: sql<number>`sum(${transcriptionTasks.durationSeconds})`,
    })
    .from(users)
    .leftJoin(apiKeys, eq(users.id, apiKeys.userId))
    .leftJoin(transcriptionTasks, eq(apiKeys.id, transcriptionTasks.apiKeyId))
    .where(isNull(users.deletedAt))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}

export async function createUser(companyName: string) {
  const now = new Date();
  await database.insert(users).values({
    id: randomUUID(),
    companyName,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    saOrmSentinel: null,
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  await database.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, userId));
}

export interface DateRangeFilter {
  from: Date;
  to: Date;
}

export async function getUserById(userId: string) {
  const [user] = await database
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)));
  return user;
}

export async function getApiKeysByUserId(userId: string, dateRange?: DateRangeFilter) {
  const conditions = [eq(apiKeys.userId, userId), isNull(apiKeys.deletedAt)];

  let taskConditions: SQL | undefined = eq(apiKeys.id, transcriptionTasks.apiKeyId);

  if (dateRange) {
    taskConditions = and(
      taskConditions,
      gte(transcriptionTasks.createdAt, dateRange.from),
      lte(transcriptionTasks.createdAt, dateRange.to)
    );
  }

  return database
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      requestCount: sql<number>`count(${transcriptionTasks.id})`,
      totalDuration: sql<number>`coalesce(sum(${transcriptionTasks.durationSeconds}), 0)`,
    })
    .from(apiKeys)
    .leftJoin(transcriptionTasks, taskConditions)
    .where(and(...conditions))
    .groupBy(apiKeys.id)
    .orderBy(desc(apiKeys.createdAt));
}

export async function createApiKey(
  userId: string,
  keyPrefix: string,
  keyHash: string,
  name?: string
) {
  const now = new Date();
  const [result] = await database
    .insert(apiKeys)
    .values({
      id: randomUUID(),
      userId,
      keyPrefix,
      keyHash,
      name: name || null,
      isActive: true,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      saOrmSentinel: null,
    })
    .returning();
  return result;
}

export async function toggleApiKeyStatus(apiKeyId: string, isActive: boolean) {
  await database
    .update(apiKeys)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(apiKeys.id, apiKeyId));
}

export async function getAnalytics(dateFrom?: Date, dateTo?: Date) {
  const dateConditions = [];

  if (dateFrom) {
    dateConditions.push(gte(transcriptionTasks.createdAt, dateFrom));
  }

  if (dateTo) {
    const dateToEnd = new Date(dateTo);
    dateToEnd.setHours(23, 59, 59, 999);
    dateConditions.push(lte(transcriptionTasks.createdAt, dateToEnd));
  }

  const taskWhere = dateConditions.length > 0 ? and(...dateConditions) : undefined;

  const [stats] = await database
    .select({
      totalRequests: sql<number>`count(${transcriptionTasks.id}) filter (where ${transcriptionTasks.id} is not null ${taskWhere ? sql`and ${taskWhere}` : sql``})`,
      totalDurationSeconds: sql<number>`sum(${transcriptionTasks.durationSeconds}) filter (where ${transcriptionTasks.id} is not null ${taskWhere ? sql`and ${taskWhere}` : sql``})`,
      activeUsers: sql<number>`count(distinct case when ${users.isActive} = true then ${users.id} end)`,
      totalApiKeys: sql<number>`count(distinct ${apiKeys.id})`,
    })
    .from(users)
    .leftJoin(apiKeys, eq(users.id, apiKeys.userId))
    .leftJoin(transcriptionTasks, eq(apiKeys.id, transcriptionTasks.apiKeyId))
    .where(isNull(users.deletedAt));

  const tasksByStatus = await database
    .select({
      status: transcriptionTasks.status,
      count: sql<number>`count(*)`,
    })
    .from(transcriptionTasks)
    .where(taskWhere)
    .groupBy(transcriptionTasks.status);

  const statusMap = tasksByStatus.reduce(
    (acc, item) => {
      acc[item.status] = Number(item.count);
      return acc;
    },
    {} as Record<string, number>
  );

  const topUsers = await database
    .select({
      id: users.id,
      companyName: users.companyName,
      requestCount: sql<number>`count(${transcriptionTasks.id})`,
      totalDuration: sql<number>`coalesce(sum(${transcriptionTasks.durationSeconds}), 0)`,
    })
    .from(users)
    .leftJoin(apiKeys, eq(users.id, apiKeys.userId))
    .leftJoin(
      transcriptionTasks,
      taskWhere
        ? and(eq(apiKeys.id, transcriptionTasks.apiKeyId), taskWhere)
        : eq(apiKeys.id, transcriptionTasks.apiKeyId)
    )
    .where(isNull(users.deletedAt))
    .groupBy(users.id)
    .orderBy(desc(sql`count(${transcriptionTasks.id})`))
    .limit(5);

  return {
    ...stats,
    tasksByStatus: statusMap,
    topUsers: topUsers.filter((u) => u.requestCount > 0),
  };
}

export async function deleteApiKey(apiKeyId: string) {
  await database
    .update(apiKeys)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(apiKeys.id, apiKeyId));
}

export async function deleteUser(userId: string) {
  await database
    .update(users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}
