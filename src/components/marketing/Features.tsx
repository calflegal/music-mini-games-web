export function Features() {
  return (
    <>
      <style>{`
        .features {
          padding: var(--space-2xl) var(--space-sm);
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
        }

        .features .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features .section-title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          text-align: center;
          color: #1d1d1f;
          margin-bottom: var(--space-sm);
        }

        .features .section-description {
          text-align: center;
          font-size: clamp(16px, 2.5vw, 18px);
          color: #6e6e73;
          margin-bottom: var(--space-xl);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-md);
        }

        .features .feature {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--space-md);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .features .feature:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .features .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: var(--space-xs);
          color: #1d1d1f;
        }

        .features .feature-description {
          font-size: 14px;
          color: #6e6e73;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .features .features-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }
        }
      `}</style>
      <section className="features">
        <div className="container">
          <h2 className="section-title">Powerful Features for Musical Growth</h2>
          <p className="section-description">
            Everything you need to improve your pitch accuracy, train your ear, and master musical skills through three engaging games.
          </p>

          <div className="features-grid">
            <div className="feature">
              <h3 className="feature-title">Live Audio Processing</h3>
              <p className="feature-description">
                Instant pitch detection for Strike a Chord, precise pitch shifting for Pitchin' Impossible, and real marimba samples in Progressions.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">Three Complete Music Games</h3>
              <p className="feature-description">
                Progressions for chord progression ear training, Strike a Chord for chord singing, and Pitchin' Impossible for pitch discrimination. Multiple ways to improve.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">Daily Challenges</h3>
              <p className="feature-description">
                Progressions and Strike a Chord each serve one puzzle per day, same for everyone worldwide. Come back daily and build your streak.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">Difficulty That Grows With You</h3>
              <p className="feature-description">
                Progressions moves from multiple choice up to Hard mode, where you enter every chord yourself. Center your ear anytime with the I, V, I reference button.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">21 Chord Types</h3>
              <p className="feature-description">
                Start with basic major, minor, augmented, and diminished chords. One purchase unlocks every chord type across both chord games.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">No Subscription</h3>
              <p className="feature-description">
                Free to download with optional purchases. No recurring fees. Own your learning forever.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">iPhone & iPad</h3>
              <p className="feature-description">
                Beautiful interface optimized for all iOS devices. Works great on iPhone and iPad with full support.
              </p>
            </div>

            <div className="feature">
              <h3 className="feature-title">Session Recording</h3>
              <p className="feature-description">
                Strike a Chord's Practice mode automatically records your sessions. Listen back to track your improvement over time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
