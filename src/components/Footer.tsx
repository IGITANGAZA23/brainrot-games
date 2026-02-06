import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer glass-card" style={{ margin: '2rem 1rem 1rem', padding: '1.5rem', textAlign: 'center' }}>
      <div className="footer-wrapper">
        <div className="footer-content">
          <div className="footer-text" style={{ color: '#888', marginBottom: '1rem' }}>
            Curated by <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>The Coding Sloth</span> for the ultimate rot.
          </div>
          <nav className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            {[
              { name: 'YouTube', url: 'https://www.youtube.com/@TheCodingSloth' },
              { name: 'Newsletter', url: 'https://slothbytes.beehiiv.com/subscribe' },
              { name: 'GitHub', url: 'https://github.com/The-CodingSloth/brainrot-games' }
            ].map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
