import { useEffect } from 'react';

export function Hero() {
  useEffect(() => {
    // Load MailerLite form script
    const script = document.createElement('script');
    script.src = 'https://static.mailerlite.com/js/w/webforms.min.js?v1c75f89fdaf105853da4af6f08e96c33';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <style>{`
        .hero {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--space-lg) var(--space-sm);
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          position: relative;
        }

        .hero .container {
          max-width: 800px;
          text-align: center;
          position: relative;
        }

        .hero .headline {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: var(--space-xs);
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero .tagline {
          font-size: clamp(14px, 2vw, 18px);
          color: var(--practice-green);
          font-weight: 500;
          margin-bottom: var(--space-md);
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }

        .hero .subheadline {
          font-size: clamp(16px, 3vw, 20px);
          color: #6e6e73;
          margin-bottom: var(--space-lg);
          line-height: 1.5;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .hero .app-store-badge {
          display: inline-block;
          transition: transform 0.2s ease;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .hero .app-store-badge img {
          height: 60px;
          width: auto;
        }

        .hero .app-store-badge:hover {
          transform: scale(1.05);
        }

        .hero .app-store-badge:active {
          transform: scale(0.98);
        }

        .hero .newsletter-form-wrapper {
          margin-top: var(--space-md);
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero .contact-line {
          margin-top: var(--space-md);
          font-size: 14px;
          color: #6e6e73;
          animation: fadeInUp 0.8s ease-out 0.7s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .hero {
            min-height: 75vh;
            padding-bottom: var(--space-md);
          }

          .hero .app-store-badge img {
            height: 50px;
          }
        }
      `}</style>
      <section className="hero">
        <div className="container">
          <h1 className="headline">Music Mini Games</h1>
          <p className="tagline">Play. Practice. Progress.</p>
          <p className="subheadline">
            Learn music through interactive mini-games. Master chord singing and train your ear with two engaging games featuring real-time audio processing.
          </p>
          <a
            href="https://apps.apple.com/app/apple-store/id6752395649?pt=1534960&ct=mmg-landing&mt=8"
            className="app-store-badge"
            aria-label="Download on the App Store"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'cta_click', {
                  event_category: 'engagement',
                  event_label: 'hero_app_store',
                  value: 1
                });
              }
            }}
          >
            <img src="/app_store_badge.svg" alt="Download on the App Store" />
          </a>

          <div className="newsletter-form-wrapper">
            <div className="ml-embedded" data-form="0JVkKe"></div>
          </div>

          <p className="contact-line">Feedback? Questions? email calvin [at] musicminigames.com</p>
        </div>
      </section>
    </>
  );
}
