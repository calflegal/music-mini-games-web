import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      {
        title: 'Privacy Policy - Music Mini Games',
      },
      {
        name: 'description',
        content: 'The privacy policy for Music Mini Games.',
      },
    ],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <>
      <style>{`
        .privacy {
          max-width: 640px;
          margin: 0 auto;
          padding: var(--space-xl) var(--space-sm) var(--space-2xl);
          line-height: 1.6;
        }

        .privacy .back-link {
          display: inline-block;
          margin-bottom: var(--space-md);
          color: #6e6e73;
          font-size: 14px;
          text-decoration: none;
        }

        .privacy .back-link:hover {
          text-decoration: underline;
        }

        .privacy h1 {
          font-size: 28px;
          margin-bottom: var(--space-md);
          color: #1d1d1f;
        }

        .privacy h2 {
          font-size: 18px;
          margin-top: var(--space-md);
          margin-bottom: var(--space-xs);
          color: var(--practice-green);
        }

        .privacy p,
        .privacy li {
          color: #3a3a3c;
          margin-bottom: 12px;
        }

        .privacy ul {
          padding-left: 20px;
        }

        .privacy a {
          color: var(--premium-blue);
        }

        .privacy .updated {
          color: #a1a1a6;
          font-size: 12px;
          margin-top: var(--space-lg);
        }

        .privacy footer {
          margin-top: var(--space-lg);
          color: #a1a1a6;
          font-size: 14px;
        }
      `}</style>
      <div className="privacy">
        <Link to="/" className="back-link">
          &larr; Back to Home
        </Link>

        <h1>Privacy Policy</h1>

        <p>
          This policy covers the Music Mini Games iOS app and the
          musicminigames.com website.
        </p>

        <h2>Information We Collect</h2>
        <p>
          Music Mini Games does not require an account. We never collect your
          name, email address, or contact information. The app collects a
          minimal amount of data, none of which is linked to your identity:
        </p>
        <ul>
          <li>
            <strong>Anonymous Identifier:</strong> A random ID generated on
            your device the first time you play. It is not derived from your
            device hardware, Apple ID, or any personal information.
          </li>
          <li>
            <strong>Gameplay Data:</strong> Game sessions, daily-challenge
            results, and aggregate event counters that tell us how the app is
            used.
          </li>
          <li>
            <strong>Purchase History:</strong> Records of in-app purchases,
            verified with Apple, so we can unlock what you bought and restore
            it later.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use this data to:</p>
        <ul>
          <li>Save your progress, streaks, and daily-challenge results</li>
          <li>Process and restore your purchases</li>
          <li>Understand aggregate usage so we can improve the games</li>
        </ul>

        <h2>What We Don't Do</h2>
        <ul>
          <li>No advertising</li>
          <li>No third-party analytics or tracking SDKs in the app</li>
          <li>No tracking across other companies' apps or websites</li>
          <li>We never sell your data</li>
        </ul>

        <h2>Where Your Data Lives</h2>
        <p>
          Data is stored on our own backend, hosted on infrastructure
          providers (Fly.io for servers, Crunchy Bridge for the database). We
          may share data with service providers only as needed to operate the
          service, such as these hosting providers and Apple for payment
          processing.
        </p>

        <h2>Data Retention &amp; Deletion</h2>
        <p>
          We retain gameplay and purchase data for as long as needed to
          provide the service. To request deletion of the data associated with
          your device, email us at the address below and we will remove it.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          The app collects no personal information from anyone, including
          children. Everything is stored under an anonymous identifier.
        </p>

        <h2>This Website</h2>
        <p>
          The musicminigames.com website uses Google Analytics to understand
          site traffic and MailerLite for our email newsletter if you choose
          to sign up. The iOS app does not use these services.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          If we make material changes to this policy, we will update this page
          and the date below.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, please email: calvin.flegal [at]
          gmail dot com
        </p>

        <p className="updated">Last updated: July 2026</p>

        <footer>© {new Date().getFullYear()} Music Mini Games</footer>
      </div>
    </>
  )
}
