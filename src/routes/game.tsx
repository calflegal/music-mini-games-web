import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { createServerFn } from '@tanstack/react-start'
import { dbMiddleware } from '@/lib/db-middleware'
import { getHighScores, createUser, saveHighScore } from '@/db/scoresModel'

export const Route = createFileRoute('/game')({ component: Game })

// Server function to create user and save score
const submitScoreServerFn = createServerFn({ method: 'POST' })
  .middleware([dbMiddleware])
  .handler(async ({ data, context }) => {
    const { name, score } = data as { name: string; score: number }

    // Create user first
    const user = await createUser(context.db, { name })

    // Then save the score with the user_id
    const savedScore = await saveHighScore(context.db, {
      score,
      userId: user.id
    })

    return { user, savedScore }
  })

// Server function to get top 100 high scores
const getHighScoresServerFn = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async (ctx) => {
    return getHighScores(ctx.context.db)
  })

type GameStatus = 'playing' | 'finished'

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const circlesRef = useRef<Matter.Body[]>([])
  const arrowsRef = useRef<Matter.Body[]>([])
  const particlesRef = useRef<Matter.Body[]>([])
  const originalColorsRef = useRef<Map<Matter.Body, { r: number; g: number; b: number }>>(new Map())
  const particleTimesRef = useRef<Map<Matter.Body, number>>(new Map())
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Game state
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [showHighScores, setShowHighScores] = useState(false)
  const [highScoresList, setHighScoresList] = useState<Array<{ id: number; score: number; userName: string; createdAt: Date | null }>>([])
  const [isLoadingScores, setIsLoadingScores] = useState(false)
  const [showNameForm, setShowNameForm] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Use ref to track game status to avoid recreating the physics engine
  const gameStatusRef = useRef<GameStatus>('playing')
  const hasEndedRef = useRef(false) // Track if we've already handled game end

  useEffect(() => {
    gameStatusRef.current = gameStatus
  }, [gameStatus])

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setGameStatus('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStatus])

  // Load high scores when game ends (but don't save yet)
  useEffect(() => {
    if (gameStatus === 'finished' && !hasEndedRef.current) {
      hasEndedRef.current = true
      setShowHighScores(true)
      setShowNameForm(true)
      setIsLoadingScores(true)

      // Trigger mount animation after a brief delay
      setTimeout(() => setIsMounted(true), 10)

      // Load high scores but don't save the current score yet
      getHighScoresServerFn()
        .then((scores) => {
          setHighScoresList(scores)
          setIsLoadingScores(false)
        })
        .catch((err) => {
          console.error('Failed to load scores:', err)
          setIsLoadingScores(false)
        })
    }
  }, [gameStatus, score])

  // Auto-focus name input when form appears
  useEffect(() => {
    if (showNameForm && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [showNameForm])

  // Handle name submission
  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsSubmitting(true)

    try {
      // Create user and save score
      await submitScoreServerFn({ data: { name: playerName.trim(), score } })

      // Refresh high scores to show the new entry
      const updatedScores = await getHighScoresServerFn()
      setHighScoresList(updatedScores)

      // Hide the form
      setShowNameForm(false)
    } catch (err) {
      console.error('Failed to submit score:', err)
      alert('Failed to submit score. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Play again handler
  const handlePlayAgain = () => {
    setScore(0)
    setTimeLeft(30)
    setGameStatus('playing')
    setShowHighScores(false)
    setShowNameForm(false)
    setHighScoresList([])
    setPlayerName('')
    setIsMounted(false)
    gameStatusRef.current = 'playing'
    hasEndedRef.current = false
  }

  useEffect(() => {
    if (!canvasRef.current) return

    // Create engine with gentle gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.1 }, // Very gentle downward gravity
    })
    engineRef.current = engine

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
      },
    })
    renderRef.current = render

    // Generate bright colors
    const brightColors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#84cc16', // lime
      '#22c55e', // green
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#a855f7', // purple
      '#d946ef', // fuchsia
      '#ec4899', // pink
      '#f43f5e', // rose
    ]

    // Continuously generate circles at random intervals
    const rightHalfStart = window.innerWidth / 2
    let isGenerating = true

    const generateCircle = () => {
      if (!isGenerating || !engineRef.current || gameStatusRef.current !== 'playing') return

      // Randomly generate 0-3 circles
      const numCircles = Math.floor(Math.random() * 4)

      for (let i = 0; i < numCircles; i++) {
        const circleX = rightHalfStart + Math.random() * (window.innerWidth - rightHalfStart - 50)
        const circleY = 50 // Start from top
        const radius = 12 + Math.random() * 18 // Random size between 12-30
        const color = brightColors[Math.floor(Math.random() * brightColors.length)]

        const circle = Matter.Bodies.circle(circleX, circleY, radius, {
          restitution: 0.8,
          friction: 0.001,
          isStatic: false,
          label: 'ball', // Label for collision detection
          render: {
            fillStyle: color,
            strokeStyle: 'transparent',
            lineWidth: 0,
          },
        })

        // Store original RGB values
        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        originalColorsRef.current.set(circle, { r, g, b })

        circlesRef.current.push(circle)
        Matter.Composite.add(engineRef.current.world, circle)
      }

      // Schedule next batch with ~1 second delay with some randomness
      const nextDelay = 800 + Math.random() * 400 // Random delay between 800-1200ms
      setTimeout(generateCircle, nextDelay)
    }

    // Start generating circles
    generateCircle()

    // Create and run the runner
    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    // Track processed collisions to avoid duplicates
    const processedCollisions = new Set<string>()

    // Collision detection for arrow hits
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair

        // Check if collision is between arrow and ball
        let arrowPart: Matter.Body | null = null
        let ball: Matter.Body | null = null

        if (bodyA.label === 'arrow' && bodyB.label === 'ball') {
          arrowPart = bodyA
          ball = bodyB
        } else if (bodyB.label === 'arrow' && bodyA.label === 'ball') {
          arrowPart = bodyB
          ball = bodyA
        }

        if (arrowPart && ball && engineRef.current && gameStatusRef.current === 'playing') {
          // Get the parent arrow body (composite)
          const arrow = arrowPart.parent

          // Create unique collision ID to prevent duplicate processing
          const collisionId = `${arrow.id}-${ball.id}`
          if (processedCollisions.has(collisionId)) {
            return // Already processed this collision
          }
          processedCollisions.add(collisionId)

          // Increment score
          setScore((prev) => prev + 1)

          // Get ball color
          const rgb = originalColorsRef.current.get(ball)
          if (!rgb) return

          const ballPos = ball.position
          const arrowPos = arrow.position
          const arrowVel = arrow.velocity

          // Create ball explosion particles
          const numParticles = 15 + Math.floor(Math.random() * 10) // 15-25 particles

          for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 * i) / numParticles + Math.random() * 0.5
            const speed = 2 + Math.random() * 4
            const particleRadius = 3 + Math.random() * 5

            const particle = Matter.Bodies.circle(ballPos.x, ballPos.y, particleRadius, {
              friction: 0.001,
              frictionAir: 0.02,
              restitution: 0.6,
              label: 'particle',
              render: {
                fillStyle: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
                strokeStyle: `rgba(255, 255, 255, 0.8)`,
                lineWidth: 2,
              },
            })

            // Set velocity in explosion pattern
            Matter.Body.setVelocity(particle, {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
            })

            particlesRef.current.push(particle)
            particleTimesRef.current.set(particle, Date.now())
            originalColorsRef.current.set(particle, rgb)
            Matter.Composite.add(engineRef.current.world, particle)
          }

          // Create arrow fragments (6-8 pieces)
          const numArrowPieces = 6 + Math.floor(Math.random() * 3)
          const arrowColor = { r: 251, g: 191, b: 36 } // Gold color

          for (let i = 0; i < numArrowPieces; i++) {
            const fragmentAngle = Math.random() * Math.PI * 2
            const fragmentSpeed = 1 + Math.random() * 3
            const fragmentLength = 8 + Math.random() * 12
            const fragmentWidth = 2 + Math.random() * 2

            const fragment = Matter.Bodies.rectangle(
              arrowPos.x,
              arrowPos.y,
              fragmentLength,
              fragmentWidth,
              {
                angle: Math.random() * Math.PI * 2,
                friction: 0.001,
                frictionAir: 0.03,
                restitution: 0.4,
                label: 'particle',
                render: {
                  fillStyle: '#fbbf24',
                  strokeStyle: 'transparent',
                },
              }
            )

            // Set velocity based on original arrow velocity plus some randomness
            Matter.Body.setVelocity(fragment, {
              x: arrowVel.x * 0.3 + Math.cos(fragmentAngle) * fragmentSpeed,
              y: arrowVel.y * 0.3 + Math.sin(fragmentAngle) * fragmentSpeed,
            })

            // Add some spin
            Matter.Body.setAngularVelocity(fragment, (Math.random() - 0.5) * 0.3)

            particlesRef.current.push(fragment)
            particleTimesRef.current.set(fragment, Date.now())
            originalColorsRef.current.set(fragment, arrowColor)
            Matter.Composite.add(engineRef.current.world, fragment)
          }

          // Remove the entire arrow composite and ball
          Matter.Composite.remove(engineRef.current.world, [arrow, ball])
          arrowsRef.current = arrowsRef.current.filter(a => a.id !== arrow.id)
          circlesRef.current = circlesRef.current.filter(c => c.id !== ball.id)
          originalColorsRef.current.delete(ball)

          // Clean up collision tracking after removal
          setTimeout(() => {
            processedCollisions.delete(collisionId)
          }, 100)
        }
      })
    })

    // Animation loop for fading and arrow rotation
    const animationLoop = () => {
      if (!engineRef.current) return

      const circlesToRemove: Matter.Body[] = []
      const arrowsToRemove: Matter.Body[] = []
      const particlesToRemove: Matter.Body[] = []
      const now = Date.now()

      // Update circles
      circlesRef.current.forEach((circle) => {
        const circleY = circle.position.y

        // Calculate opacity based on position (fade as it falls)
        const opacity = Math.max(0, 1 - (circleY / window.innerHeight) * 0.8)

        // Get original RGB from stored values
        const rgb = originalColorsRef.current.get(circle)
        if (rgb) {
          // Update circle color with opacity
          circle.render.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
        }

        // Mark for removal when it's below the viewport
        if (circleY > window.innerHeight + 50) {
          circlesToRemove.push(circle)
        }
      })

      // Update particles - glow and fade out
      particlesRef.current.forEach((particle) => {
        const createdTime = particleTimesRef.current.get(particle) || now
        const age = now - createdTime
        const lifetime = 2000 // 2 seconds

        // Calculate opacity based on age
        const opacity = Math.max(0, 1 - age / lifetime)

        const rgb = originalColorsRef.current.get(particle)
        if (rgb) {
          // Update particle color with opacity and glow
          particle.render.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
          particle.render.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
          particle.render.lineWidth = 2
        }

        // Mark for removal when faded out
        if (opacity <= 0) {
          particlesToRemove.push(particle)
        }
      })

      // Update arrows - rotate to follow trajectory and check for off-screen removal
      arrowsRef.current.forEach((arrow) => {
        // Rotate arrow to point in direction of travel
        const velocity = arrow.velocity
        const angle = Math.atan2(velocity.y, velocity.x)
        Matter.Body.setAngle(arrow, angle)

        // Remove arrows that are off screen
        const pos = arrow.position
        if (
          pos.x < -100 ||
          pos.x > window.innerWidth + 100 ||
          pos.y < -100 ||
          pos.y > window.innerHeight + 100
        ) {
          arrowsToRemove.push(arrow)
        }
      })

      // Remove circles that have left the viewport
      if (circlesToRemove.length > 0) {
        Matter.Composite.remove(engineRef.current.world, circlesToRemove)
        circlesRef.current = circlesRef.current.filter(
          (circle) => !circlesToRemove.includes(circle)
        )
        // Clean up stored colors
        circlesToRemove.forEach((circle) => {
          originalColorsRef.current.delete(circle)
        })
      }

      // Remove arrows that are off screen
      if (arrowsToRemove.length > 0) {
        Matter.Composite.remove(engineRef.current.world, arrowsToRemove)
        arrowsRef.current = arrowsRef.current.filter(
          (arrow) => !arrowsToRemove.includes(arrow)
        )
      }

      // Remove faded particles
      if (particlesToRemove.length > 0) {
        Matter.Composite.remove(engineRef.current.world, particlesToRemove)
        particlesRef.current = particlesRef.current.filter(
          (particle) => !particlesToRemove.includes(particle)
        )
        particlesToRemove.forEach((particle) => {
          particleTimesRef.current.delete(particle)
          originalColorsRef.current.delete(particle)
        })
      }

      requestAnimationFrame(animationLoop)
    }
    animationLoop()

    // Handle click to shoot arrow
    const handleClick = (event: MouseEvent) => {
      if (!engineRef.current || gameStatusRef.current !== 'playing') return

      const clickX = event.clientX
      const clickY = event.clientY

      // Arrow starts from bottom left corner of screen
      const startX = 50
      const startY = window.innerHeight - 50

      // Calculate direction vector
      const dx = clickX - startX
      const dy = clickY - startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Normalize and scale velocity (adjust speed multiplier as needed)
      const speed = 15
      const velocityX = (dx / distance) * speed
      const velocityY = (dy / distance) * speed

      // Calculate angle for arrow rotation
      const angle = Math.atan2(dy, dx)

      // Create arrow shaft (rectangle centered at origin)
      const shaftLength = 30
      const shaftWidth = 3
      const shaft = Matter.Bodies.rectangle(0, 0, shaftLength, shaftWidth, {
        label: 'arrow',
        render: {
          fillStyle: '#fbbf24',
        },
      })

      // Create arrow head (triangle at right end of shaft)
      const headSize = 10
      const shaftEnd = shaftLength / 2
      const head = Matter.Bodies.fromVertices(
        shaftEnd + headSize / 2,
        0,
        [
          [
            { x: shaftEnd + headSize, y: 0 }, // Tip (point)
            { x: shaftEnd, y: -headSize / 2 }, // Bottom
            { x: shaftEnd, y: headSize / 2 }, // Top
          ],
        ],
        {
          label: 'arrow',
          render: {
            fillStyle: '#fbbf24',
          },
        }
      )

      // Combine shaft and head into a single composite arrow
      const arrow = Matter.Body.create({
        parts: [shaft, head],
        friction: 0.001,
        frictionAir: 0.01,
        restitution: 0.3,
        label: 'arrow',
      })

      // Set initial position and angle
      Matter.Body.setPosition(arrow, { x: startX, y: startY })
      Matter.Body.setAngle(arrow, angle)

      // Set initial velocity
      Matter.Body.setVelocity(arrow, { x: velocityX, y: velocityY })

      // Add to world and track
      Matter.Composite.add(engineRef.current.world, arrow)
      arrowsRef.current.push(arrow)
    }

    // Handle window resize
    const handleResize = () => {
      if (renderRef.current) {
        renderRef.current.canvas.width = window.innerWidth
        renderRef.current.canvas.height = window.innerHeight
        renderRef.current.options.width = window.innerWidth
        renderRef.current.options.height = window.innerHeight
        Matter.Render.setPixelRatio(renderRef.current, window.devicePixelRatio)
      }
    }

    if (canvasRef.current) {
      canvasRef.current.addEventListener('click', handleClick)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      isGenerating = false
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleClick)
      }
      window.removeEventListener('resize', handleResize)
      if (runnerRef.current && engineRef.current) {
        Matter.Runner.stop(runnerRef.current)
      }
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current)
        renderRef.current.canvas.remove()
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current)
      }
      originalColorsRef.current.clear()
      particleTimesRef.current.clear()
      circlesRef.current = []
      arrowsRef.current = []
      particlesRef.current = []
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Score and Timer Overlay */}
      {gameStatus === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-none z-10">
          <div className="text-4xl font-bold text-white drop-shadow-lg">
            Score: {score}
          </div>
          <div className={`text-4xl font-bold drop-shadow-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            Time: {timeLeft}s
          </div>
        </div>
      )}

      {/* High Scores Table */}
      {showHighScores && (
        <div
          className={`absolute inset-0 flex items-center justify-center p-4 z-20 transition-all duration-300 ${
            isMounted ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
          }`}
        >
          <div
            className={`bg-slate-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col transition-all duration-300 ${
              isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-4xl font-bold text-white mb-4 text-center">Game Over!</h2>

            {/* Name Entry Form or Score Display */}
            {showNameForm ? (
              <form onSubmit={handleSubmitName} className="mb-6 transition-opacity duration-300">
                <p className="text-2xl text-white mb-4 text-center">
                  Your Score: <span className="font-bold text-yellow-400">{score}</span>
                </p>
                <div className="flex gap-3">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !playerName.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-2xl text-white mb-6 text-center transition-opacity duration-300">
                Your Score: <span className="font-bold text-yellow-400">{score}</span>
              </p>
            )}

            <h3 className="text-2xl font-bold text-white mb-4">High Scores</h3>

            {/* Scrollable scores list */}
            <div className="flex-1 overflow-y-auto mb-6 bg-slate-900 rounded-lg">
              {isLoadingScores ? (
                <div className="p-8 text-center text-slate-400">Loading high scores...</div>
              ) : highScoresList.length === 0 ? (
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
                    {highScoresList.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={`border-t border-slate-700 ${
                          entry.score === score && entry.userName === playerName && !showNameForm ? 'bg-yellow-900/30' : ''
                        }`}
                      >
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

            <button
              onClick={handlePlayAgain}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
