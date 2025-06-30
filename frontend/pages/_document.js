import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Inter font from Google Fonts (Keep this, it's external resource) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicons (Keep these, they are static resources) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Manifest for PWA (Keep this) */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Meta tags for mobile (Keep these) */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* IMPORTANT: Remove hardcoded theme-color meta if it clashes with your dynamic theme values.
                     You already set a theme-color in _app.js Head for dynamic theme.
                     If you want a fallback theme color for browsers before JS loads, you can keep one.
                     Let's remove for now to simplify and ensure ThemeContext controls it. */}
        {/* <meta name="theme-color" content="#b8d2b3" /> */}
        <meta name="msapplication-TileColor" content="#b8d2b3" /> {/* This is for IE/Edge, usually safe to keep */}
        
        {/* IMPORTANT: REMOVE ALL INLINE <style> TAGS WITH CSS VARIABLES.
                      These are handled by ThemeContext.js and globals.css. */}
      </Head>
      {/* IMPORTANT: REMOVE hardcoded classes from body.
                    body will get its styles from globals.css's `body` rule,
                    which uses `var(--bg-primary)` and `var(--text-primary)`,
                    which are set by ThemeContext.js. */}
      <body>
        {/* NoScript fallback (Keep this, it's good practice) */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ffffff',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>
              JavaScript Required
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6b7280', maxWidth: '500px' }}>
              This application requires JavaScript to be enabled in your browser. 
              Please enable JavaScript and refresh the page to continue.
            </p>
          </div>
        </noscript>
        
        <Main /> {/* This is where your React app (including _app.js) gets injected */}
        <NextScript /> {/* This injects Next.js's JavaScript bundles */}
        
        {/* Analytics and other scripts can go here (Keep these if they don't use React hooks) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics - replace with your GA4 ID */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </Html>
  );
}
