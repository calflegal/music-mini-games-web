import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { dbMiddleware } from '@/lib/db-middleware'
import { getHighScores } from '@/db/scoresModel'

const getHighScoresServerFn = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async (ctx) => {
    return getHighScores(ctx.context.db)
  })

export const Route = createFileRoute('/scores')({
  component: HighScores,
  loader: async () => await getHighScoresServerFn(),
})

function HighScores() {
  const scores = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <h2 className="text-4xl font-bold text-white mb-6 text-center">High Scores</h2>

        {/* Scrollable scores list */}
        <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg">
          {scores.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No scores yet. Be the first!</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-800">
                <tr>
                  <th className="text-left p-3 text-slate-300 font-semibold">Rank</th>
                  <th className="text-left p-3 text-slate-300 font-semibold">Name</th>
                  <th className="text-right p-3 text-slate-300 font-semibold">Score</th>
                  <th className="text-right p-3 text-slate-300 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, index) => (
                  <tr key={entry.id} className="border-t border-slate-700">
                    <td className="p-3 text-white">
                      {index === 0 && '🥇 '}
                      {index === 1 && '🥈 '}
                      {index === 2 && '🥉 '}
                      #{index + 1}
                    </td>
                    <td className="p-3 text-white">{entry.userName}</td>
                    <td className="p-3 text-white text-right font-bold">{entry.score}</td>
                    <td className="p-3 text-slate-400 text-right text-sm">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <a
          href="/game"
          className="mt-6 block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-lg transition-all duration-200 transform hover:scale-105 text-center"
        >
          Play Game
        </a>
      </div>
    </div>
  )
}
