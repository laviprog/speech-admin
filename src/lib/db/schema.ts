import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const taskStatus = pgEnum('task_status', [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELED',
]);
export const transcriptionLanguage = pgEnum('transcription_language', ['EN', 'RU']);
export const transcriptionModel = pgEnum('transcription_model', [
  'SMALL',
  'TURBO',
  'LARGE_V3_TURBO',
]);

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  saOrmSentinel: integer('sa_orm_sentinel'),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }),
  isActive: boolean('is_active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  saOrmSentinel: integer('sa_orm_sentinel'),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  keyPrefix: varchar('key_prefix', { length: 16 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  isActive: boolean('is_active').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  saOrmSentinel: integer('sa_orm_sentinel'),
});

export const transcriptionTasks = pgTable('transcription_tasks', {
  id: uuid('id').primaryKey(),
  apiKeyId: uuid('api_key_id').notNull(),
  status: taskStatus('status').notNull(),
  message: varchar('message', { length: 2048 }),
  model: transcriptionModel('model').notNull(),
  language: transcriptionLanguage('language').notNull(),
  recognitionMode: boolean('recognition_mode').notNull(),
  numSpeakers: integer('num_speakers'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationSeconds: doublePrecision('duration_seconds'),
  fileSizeBytes: integer('file_size_bytes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  saOrmSentinel: integer('sa_orm_sentinel'),
});

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
  tasks: many(transcriptionTasks),
}));

export const tasksRelations = relations(transcriptionTasks, ({ one }) => ({
  apiKey: one(apiKeys, { fields: [transcriptionTasks.apiKeyId], references: [apiKeys.id] }),
}));
