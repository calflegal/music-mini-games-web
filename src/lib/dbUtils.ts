import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";

import * as scoresSchema from "@/db/scoresSchema"
import * as usersSchema from "@/db/usersSchema"


export const dbSchema = {
    ...scoresSchema,
    ...usersSchema,
}

export type Db = DrizzleD1Database<typeof dbSchema>


export const initDb = (env: Env) => {
    return drizzle(env.DB, { schema: dbSchema  }) as Db;
};






