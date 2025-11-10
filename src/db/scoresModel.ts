import { desc, eq } from 'drizzle-orm';
import { highScores, InsertHighScore } from '@/db/scoresSchema';
import { users, InsertUser } from '@/db/usersSchema';
import { Db } from '@/lib/dbUtils';

export async function getHighScores(db: Db) {
    const scores = await db
        .select({
            id: highScores.id,
            score: highScores.score,
            userId: highScores.userId,
            userName: users.name,
            createdAt: highScores.createdAt,
        })
        .from(highScores)
        .innerJoin(users, eq(highScores.userId, users.id))
        .orderBy(desc(highScores.score))
        .limit(100);
    return scores;
}

export async function createUser(db: Db, data: InsertUser) {
    const result = await db.insert(users).values(data).returning();
    return result[0];
}

export async function saveHighScore(db: Db, data: InsertHighScore) {
    const result = await db.insert(highScores).values(data).returning();
    return result[0];
}
