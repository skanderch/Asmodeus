import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* ✅ Section Hero */}
      <section className="home-hero">
        <h1 className="home-hero-title">Lilas Enterprise</h1>
        <p className="home-hero-subtitle">
          Secure. Reliable. Empowering your operations with modern tools.
        </p>
        <div className="home-hero-ctas">
          <a className="btn btn-primary" href="/register">
            Get Started
          </a>
          <a
            className="btn btn-secondary"
            href="mailto:contact@lilas-enterprise.com"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* ✅ Section Features */}
      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Security First</h3>
          <p className="feature-text">
            Enterprise-grade authentication and role-based access to keep your
            data safe.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">High Performance</h3>
          <p className="feature-text">
            Fast and responsive experience powered by a modern frontend stack.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Actionable Insights</h3>
          <p className="feature-text">
            Dashboards and analytics to support better, data-driven decisions.
          </p>
        </div>
      </section>

      {/* ✅ Section About */}
      <section className="home-about">
        <h2>About Lilas Enterprise</h2>
        <p>
          Lilas Enterprise helps organizations streamline workflows, strengthen
          security, and gain visibility across teams. Our platform is built to
          scale with your needs, enabling faster delivery and greater
          reliability.
        </p>
      </section>

      {/* ✅ Section Contact */}
      <section className="home-contact">
        <h2>Ready to see more?</h2>
        <p>Create your account or reach out to our team for a demo.</p>
        <div className="home-contact-ctas">
          <a className="btn btn-primary" href="/register">
            Create Account
          </a>
          <a
            className="btn btn-secondary"
            href="mailto:contact@lilas-enterprise.com"
          >
            Email Sales
          </a>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Lilas Enterprise. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="mailto:support@lilas-enterprise.com">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
