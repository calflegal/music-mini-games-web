import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './usersSchema';

export const highScores = sqliteTable('high_scores', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    score: integer('score').notNull(),
    userId: integer('user_id').notNull().references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export type HighScore = typeof highScores.$inferSelect
export type InsertHighScore = typeof highScores.$inferInsert
