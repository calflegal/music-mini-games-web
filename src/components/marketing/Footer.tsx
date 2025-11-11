export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer {
          background: #1d1d1f;
          color: #f5f5f7;
          padding: var(--space-2xl) var(--space-sm) var(--space-lg);
        }

        .footer .container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .footer .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .footer .footer-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 600;
          color: #f5f5f7;
          margin: 0;
        }

        .footer .app-store-badge {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .footer .app-store-badge img {
          height: 60px;
          width: auto;
        }

        .footer .app-store-badge:hover {
          transform: scale(1.05);
        }

        .footer .app-store-badge:active {
          transform: scale(0.98);
        }

        .footer .footer-bottom {
          padding-top: var(--space-lg);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer .copyright {
          font-size: 12px;
          color: #a1a1a6;
          margin: 0;
        }

        @media (max-width: 640px) {
          .footer {
            padding: var(--space-xl) var(--space-sm) var(--space-md);
          }

          .footer .app-store-badge img {
            height: 50px;
          }
        }
      `}</style>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <h2 className="footer-title">Ready to start your musical journey?</h2>
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
                    event_label: 'footer_app_store',
                    value: 1
                  });
                }
              }}
            >
              <img src="/app_store_badge.svg" alt="Download on the App Store" />
            </a>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© {currentYear} Music Mini Games. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
