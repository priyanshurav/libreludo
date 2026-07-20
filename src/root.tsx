import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './state/store';
import { PWAUpdater } from './components/PWAUpdater/PWAUpdater';
import ErrorBoundaryPage from './pages/ErrorBoundary/ErrorBoundary';
import './fonts.css';
import './index.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': ['VideoGame', 'WebApplication'],
    name: 'LibreLudo',
    url: 'https://libreludo.org/',
    description:
      'Play Ludo free in your browser. Ad-free, open-source, with local multiplayer and bot opponents. No downloads, no logins, no tracking.',
    playMode: ['MultiPlayer', 'SinglePlayer'],
    genre: ['Board Game', 'Local Multiplayer', 'Casual Game'],
    applicationCategory: 'Game',
    inLanguage: 'en',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    sameAs: 'https://github.com/priyanshurav/libreludo',
    license: 'https://www.gnu.org/licenses/agpl-3.0.html',
    author: {
      '@type': 'Person',
      name: 'Priyanshu Rav',
      url: 'https://github.com/priyanshurav',
    },
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="canonical" href="https://libreludo.org/" />
        <meta
          name="description"
          content="Play Ludo free in your browser. Ad-free, open-source, with local multiplayer and bot opponents. No downloads, no logins, no tracking."
        />

        <meta name="theme-color" content="#7C5FFF" />
        <meta name="apple-mobile-web-app-title" content="LibreLudo" />
        <meta property="og:site_name" content="LibreLudo" />

        <link rel="icon" type="image/png" href="/icons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />

        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          <PWAUpdater />
          {children}
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <ErrorBoundaryPage />;
}
