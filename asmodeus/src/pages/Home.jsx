import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* ✅ Section Hero */}
      <section className="home-hero">
        <h1 className="home-hero-title">Simplifiez vos recrutements avec CV-Tek</h1>
        <p className="home-hero-subtitle">Centralisez, automatisez et recrutez intelligemment.</p>
        <p className="home-hero-desc">
          Une plateforme innovante développée pour le service RH de Lilas, intégrant IA et
          automatisation du processus de recrutement.
        </p>
        <div className="home-hero-ctas">
          <a className="btn btn-primary" href="/register">
            Commencer
          </a>
          <a
            className="btn btn-secondary"
            href="mailto:contact@lilas-enterprise.com"
          >
            Nous contacter
          </a>
        </div>
      </section>

      {/* ✅ Section Features */}
      <div className="section-divider" />
      <section className="home-features">
        <header className="section-header">
          <h2 className="section-title">Fonctionnalités clés</h2>
          <p className="section-subtitle">Les atouts de CV-Tek pour le service RH de Lilas</p>
        </header>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3 className="feature-title">Gestion des candidatures automatisée</h3>
          <p className="feature-text">Centralisez les CV, suivez les statuts et gagnez du temps.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3 className="feature-title">IA pour le scoring et la présélection</h3>
          <p className="feature-text">Classement intelligent des profils selon vos critères.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧑‍💼</div>
          <h3 className="feature-title">Gestion des entretiens</h3>
          <p className="feature-text">Planifiez, évaluez et collaborez avec vos équipes RH.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Tableaux de bord BI pour RH</h3>
          <p className="feature-text">Indicateurs en temps réel pour piloter vos recrutements.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Sécurité et contrôle des accès</h3>
          <p className="feature-text">Rôles, permissions et chiffrement pour protéger vos données.</p>
        </div>
      </section>

      {/* ✅ Section About */}
      <div className="section-divider" />
      <section className="home-about">
        <h2 className="section-title">À propos</h2>
        <p>
          CV-Tek est développé pour accompagner le service RH de Lilas dans l’optimisation
          du processus de recrutement : centralisation des candidatures, IA pour la
          présélection, planification des entretiens et pilotage via des tableaux de bord.
        </p>
      </section>

      {/* ✅ Section Call To Action */}
      <div className="section-divider" />
      <section className="home-contact">
        <h2>Rejoignez la nouvelle expérience de recrutement de Lilas.</h2>
        <p>Créez votre compte ou contactez-nous pour une démonstration.</p>
        <div className="home-contact-ctas">
          <a className="btn btn-primary" href="/register">
            Créer un compte
          </a>
          <a
            className="btn btn-secondary"
            href="mailto:contact@lilas-enterprise.com"
          >
            Contacter l'équipe
          </a>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>Copyright © 2025 Lilas Enterprise / CV-Tek</p>
          <div className="footer-links">
            <a href="/confidentialite">Confidentialité</a>
            <a href="/conditions">Conditions</a>
            <a href="/contact">Contact</a>
            <a href="/mentions-legales">Mentions légales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
