export function GameModes() {
  return (
    <>
      <style>{`
        .game-modes {
          padding: var(--space-2xl) var(--space-sm);
          background: white;
        }

        .game-modes .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .game-modes .section-title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          text-align: center;
          color: #1d1d1f;
          margin-bottom: var(--space-sm);
        }

        .game-modes .section-description {
          text-align: center;
          font-size: clamp(16px, 2.5vw, 18px);
          color: #6e6e73;
          margin-bottom: var(--space-xl);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .game-modes .modes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .game-modes .mode-card {
          background: rgba(0, 0, 0, 0.02);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 2px solid transparent;
        }

        .game-modes .mode-card:hover {
          transform: translateY(-4px);
        }

        .game-modes .mode-card.practice {
          border-color: var(--practice-green);
        }

        .game-modes .mode-card.practice:hover {
          box-shadow: 0 8px 24px rgba(52, 199, 89, 0.15);
        }

        .game-modes .mode-card.challenge {
          border-color: var(--challenge-purple);
        }

        .game-modes .mode-card.challenge:hover {
          box-shadow: 0 8px 24px rgba(175, 82, 222, 0.15);
        }

        .game-modes .mode-card.daily {
          border-color: var(--daily-orange);
        }

        .game-modes .mode-card.daily:hover {
          box-shadow: 0 8px 24px rgba(255, 149, 0, 0.15);
        }

        .game-modes .mode-icon {
          font-size: 48px;
          margin-bottom: var(--space-sm);
        }

        .game-modes .mode-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1d1d1f;
        }

        .game-modes .mode-subtitle {
          font-size: 14px;
          color: #86868b;
          margin-bottom: var(--space-md);
        }

        .game-modes .mode-features {
          list-style: none;
          text-align: left;
          padding: 0;
        }

        .game-modes .mode-features li {
          font-size: 15px;
          color: #6e6e73;
          margin-bottom: var(--space-xs);
          padding-left: 24px;
          position: relative;
        }

        .game-modes .mode-features li::before {
          content: "✓";
          position: absolute;
          left: 0;
          font-weight: 700;
        }

        .game-modes .practice .mode-features li::before {
          color: var(--practice-green);
        }

        .game-modes .challenge .mode-features li::before {
          color: var(--challenge-purple);
        }

        .game-modes .daily .mode-features li::before {
          color: var(--daily-orange);
        }

        @media (max-width: 768px) {
          .game-modes .modes-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
      <section className="game-modes">
        <div className="container">
          <h2 className="section-title">Two Games, Endless Learning</h2>
          <p className="section-description">
            Master different musical skills with two unique games, each featuring multiple difficulty levels and comprehensive tracking.
          </p>

          <div className="modes-grid">
            {/* Strike a Chord */}
            <div className="mode-card practice">
              <div className="mode-icon">🎵</div>
              <h3 className="mode-title">Strike a Chord</h3>
              <p className="mode-subtitle">Chord Singing Game</p>
              <ul className="mode-features">
                <li>Real-time pitch detection</li>
                <li>Three modes: Practice, Challenge, Daily</li>
                <li>Learn 21 chord types</li>
                <li>Session recording & playback</li>
              </ul>
            </div>

            {/* Pitchin' Impossible */}
            <div className="mode-card challenge">
              <div className="mode-icon">🎯</div>
              <h3 className="mode-title">Pitchin' Impossible</h3>
              <p className="mode-subtitle">Pitch Discrimination Game</p>
              <ul className="mode-features">
                <li>Train your ear precision</li>
                <li>Easy, Medium, Hard difficulties</li>
                <li>Detect subtle pitch differences</li>
                <li>Three-lives scoring system</li>
              </ul>
            </div>

            {/* Shared Features */}
            <div className="mode-card daily">
              <div className="mode-icon">✨</div>
              <h3 className="mode-title">Shared Features</h3>
              <p className="mode-subtitle">Built for Success</p>
              <ul className="mode-features">
                <li>Game Center leaderboards</li>
                <li>Beautiful, intuitive interface</li>
                <li>No subscription required</li>
                <li>Optimized for all iOS devices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
