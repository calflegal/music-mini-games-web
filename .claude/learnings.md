# Music Mini Games - Project Learnings

## Project Overview
A physics-based mini game built with TanStack Start, deployed to Cloudflare Workers with D1 database integration. Players shoot arrows at falling colored circles in a 30-second timed game, then submit their name to a global leaderboard.

## Tech Stack
- **Framework**: TanStack Start v1.121 with React 19
- **Physics Engine**: Matter.js for game mechanics
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Deployment**: Cloudflare Workers

## Database Architecture

### Schema Design
We implemented a relational database structure with proper foreign key relationships:

```sql
-- Users table to store player information
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- High scores table with user reference
CREATE TABLE high_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);
```

### Key Decision: User-Score Separation
**Why we separated users from scores:**
1. **Data normalization**: Avoids duplicate user names across multiple scores
2. **Future extensibility**: Can add user profiles, authentication, or aggregate stats
3. **Referential integrity**: Foreign keys ensure data consistency
4. **Query flexibility**: Can easily get all scores for a user or user stats

### Drizzle Schema Implementation
```typescript
// usersSchema.ts
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// scoresSchema.ts
export const highScores = sqliteTable('high_scores', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    score: integer('score').notNull(),
    userId: integer('user_id').notNull().references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})
```

## Game Flow & UX Decisions

### Name Entry Flow
**The Challenge**: Originally, scores were saved immediately when the game ended, but we wanted players to enter their name first.

**Solution**: Two-phase approach
1. Game ends → Load existing leaderboard (don't save score yet)
2. Show autofocused name input form
3. Player submits name → Create user → Save score with user_id
4. Refresh leaderboard → Highlight player's entry

**Benefits**:
- Players see where they might rank before committing
- Creates anticipation and engagement
- Prevents anonymous/incomplete entries

### Animation Strategy
**Problem**: Flash of Unstyled Content (FOUC) and jarring modal appearance

**Solutions Implemented**:

1. **FOUC Prevention**
   ```css
   /* styles.css - Critical base styles */
   html {
     visibility: visible;
     opacity: 1;
   }
   body {
     margin: 0;
     padding: 0;
     min-height: 100vh;
   }
   ```

2. **Smooth Modal Transitions**
   ```typescript
   // Staggered animation mounting
   const [isMounted, setIsMounted] = useState(false)

   useEffect(() => {
     if (gameStatus === 'finished') {
       setShowHighScores(true)
       setTimeout(() => setIsMounted(true), 10) // Trigger after DOM update
     }
   }, [gameStatus])
   ```

   ```tsx
   // CSS transitions for smooth appearance
   <div className={`transition-all duration-300 ${
     isMounted ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
   }`}>
     <div className={`transition-all duration-300 ${
       isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
     }`}>
   ```

**Why 300ms duration?**:
- Fast enough to feel responsive
- Slow enough to be perceived as smooth
- Matches common UI animation standards

## TanStack Start Patterns

### Server Functions with Middleware
We learned to properly chain middleware for database access:

```typescript
const submitScoreServerFn = createServerFn({ method: 'POST' })
  .middleware([dbMiddleware])
  .handler(async ({ data, context }) => {
    const { name, score } = data as { name: string; score: number }

    // Create user first
    const user = await createUser(context.db, { name })

    // Then save score with user_id
    const savedScore = await saveHighScore(context.db, {
      score,
      userId: user.id
    })

    return { user, savedScore }
  })
```

### Database Context Pattern
```typescript
// dbUtils.ts - Centralized DB initialization
export const dbSchema = {
    ...scoresSchema,
    ...usersSchema,
}

export type Db = DrizzleD1Database<typeof dbSchema>

export const initDb = (env: Env) => {
    return drizzle(env.DB, { schema: dbSchema }) as Db;
};

// dbMiddleware.ts - Inject DB into context
export const dbMiddleware = createMiddleware({ type: 'function' })
.server(async ({ next, context }) => {
    let cloudflareContext: Env | null = null

    if (import.meta.env.DEV) {
        const wrangler = await import('wrangler');
        const { env } = await wrangler.getPlatformProxy<Env>();
        cloudflareContext = env
    } else {
        cloudflareContext = process.env as unknown as Env
    }

    return next({
        context: {
            cloudflare: cloudflareContext,
            db: initDb(cloudflareContext),
        },
    });
});
```

## Cloudflare D1 Deployment

### Local vs Remote Database Management
**Critical Learning**: D1 requires separate commands for local and remote databases

```bash
# Local development
npx wrangler d1 execute music-mini-games-db --local --command "SQL_HERE"

# Production
npx wrangler d1 execute music-mini-games-db --remote --command "SQL_HERE"
```

### Database Migration Strategy
When changing schema (adding foreign keys):
1. Drop dependent tables first (high_scores)
2. Create base tables (users)
3. Create dependent tables with foreign keys (high_scores)
4. Apply to BOTH local and remote

```bash
npx wrangler d1 execute DB_NAME --local --command "
  DROP TABLE IF EXISTS high_scores;
  CREATE TABLE users (...);
  CREATE TABLE high_scores (...);
"
```

## Matter.js Integration

### Physics Configuration
```typescript
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0.1 }, // Gentle downward gravity
})
```

**Learning**: Very gentle gravity (0.1) creates a floating effect perfect for a casual game

### Collision Detection
```typescript
// Prevent duplicate collision processing
const processedCollisions = new Set<string>()

Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((pair) => {
    const collisionId = `${arrow.id}-${ball.id}`
    if (processedCollisions.has(collisionId)) return
    processedCollisions.add(collisionId)

    // Handle collision...

    // Cleanup after delay
    setTimeout(() => processedCollisions.delete(collisionId), 100)
  })
})
```

**Why this approach?**: Matter.js can fire multiple collision events for a single collision, causing duplicate score increments

### Particle Effects
```typescript
// Store original colors for fade effects
const originalColorsRef = useRef<Map<Matter.Body, { r: number; g: number; b: number }>>(new Map())

// Update opacity in animation loop
const opacity = Math.max(0, 1 - age / lifetime)
particle.render.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
```

## React Performance Patterns

### Ref Usage for Physics State
**Problem**: React state updates trigger re-renders, but Matter.js runs in its own loop

**Solution**: Use refs to track game state that physics engine needs to check
```typescript
const gameStatusRef = useRef<GameStatus>('playing')

useEffect(() => {
  gameStatusRef.current = gameStatus
}, [gameStatus])

// In physics loop
if (gameStatusRef.current !== 'playing') return
```

### Auto-focus Pattern
```typescript
const nameInputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  if (showNameForm && nameInputRef.current) {
    nameInputRef.current.focus()
  }
}, [showNameForm])
```

## Styling Best Practices

### Avoid dangerouslySetInnerHTML
**Initial mistake**: Used `dangerouslySetInnerHTML` for critical CSS
**Correct approach**: Put base styles in CSS file

```css
/* styles.css - Lives with Tailwind imports */
@import "tailwindcss";

html {
  visibility: visible;
  opacity: 1;
}
```

### Tailwind v4 Integration
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(), // Must come before tanstackStart
    tanstackStart({
      target: "cloudflare_module",
    })
  ],
})
```

**Order matters**: Tailwind plugin must process before TanStack Start

## Deployment Process

### Build and Deploy Command
```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "deploy": "npm run build && wrangler deploy --minify ./.output/server/index.mjs"
  }
}
```

### Wrangler Configuration
```toml
name = "music-mini-games"
main = ".output/server/index.mjs"
workers_dev = true
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-09-23"

assets = {
  directory = "./.output/public/",
  binding = "ASSETS"
}

d1_databases = [
  {
    binding = "DB",
    database_name = "music-mini-games-db",
    database_id = "f99c8287-8f10-43f2-ae7d-2571119346aa"
  },
]
```

## Key Takeaways

1. **Database Design**: Proper normalization pays off - separating users from scores enables future features
2. **UX Timing**: Small delays (10ms for animation mounting) make big differences in perceived polish
3. **State Management**: Use refs for state that external systems (like physics engines) need to access
4. **CSS Loading**: Critical base styles should be in CSS files, not inline, to prevent FOUC
5. **Cloudflare D1**: Always remember to migrate both local and remote databases
6. **Animation**: 300ms transitions with scale + opacity feel professional
7. **Physics**: Gentle gravity (0.1) and low friction create satisfying gameplay
8. **Foreign Keys**: D1 supports foreign keys - use them for data integrity
9. **Server Functions**: TanStack Start's middleware system is powerful for injecting context
10. **Auto-focus**: Always focus inputs in forms that appear after user action

## Future Enhancements

Potential improvements to consider:
- [ ] User authentication (Cloudflare Access or custom)
- [ ] Player profiles with aggregate stats
- [ ] Multiple game modes (different time limits, difficulty levels)
- [ ] Combo systems and score multipliers
- [ ] Social features (friend leaderboards)
- [ ] Sound effects and music
- [ ] Mobile touch controls optimization
- [ ] PWA support for offline play
- [ ] Tournament mode with scheduled events
- [ ] Achievement system

## Performance Notes

- Client bundle: ~548 KB (174 KB gzipped)
- Worker startup time: ~13-14ms
- D1 query latency: ~0.1-0.3ms
- Animation frame rate: 60fps with Matter.js
- Smooth gameplay with 100+ physics bodies on screen

## Conclusion

This project demonstrated how modern web technologies (TanStack Start, Cloudflare Workers, D1) can create engaging, real-time experiences with global state management. The combination of proper database design, smooth animations, and efficient physics created a polished game in a surprisingly small deployment package.
