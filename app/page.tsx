import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
      <main>
        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand">
            Paws<span className="text-green">.</span><span className="text-yellow">.</span>
          </div>
        </nav>

        {/* HERO BANNER */}
        <div className="hero-banner">
          <span className="paw p1">🐾</span>
          <span className="paw p2">🐾</span>
          <span className="paw p3">🐾</span>
          <span className="paw p4">🐾</span>
          <span className="paw p5">🐾</span>
          <span className="paw p6">🐾</span>
          <span className="paw p7">🐾</span>
          <span className="paw p8">🐾</span>
          <span className="paw p9">🐾</span>
          <span className="paw p10">🐾</span>
          <span className="paw p11">🐾</span>
          <h1>
            Meet <span className="text-yellow-dark">Nela</span>
            <br />
            <em>& <span className="text-green-dark">Szogun</span></em>
          </h1>
          <p>Two dogs. Zero chill. Pick your pup 🐾</p>
        </div>

        {/* CARDS */}
        <section className="cards-section">
          <p className="section-label">Choose a dog</p>
          <div className="cards-row">

            {/* NELA */}
            <Link href="/dogs/nela" className="dog-card nela-card">
              <div className="card-photo-wrap">
                <Image
                    src="/photos/nela/nela-zgredek.jpg"
                    alt="Nela"
                    width={360}
                    height={260}
                    className="card-real-img"
                />
              </div>
              <div className="colour-strip strip-yellow" />
              <div className="card-body">
                <div className="card-top">
                  <div className="card-name">Nela</div>
                  <div className="cbadge cbadge-yellow">Lurcher</div>
                </div>
                <div className="card-breed">☀️ The professional napper</div>
                <div className="card-stats">
                  <div className="cstat">
                    <span className="cstat-num">0</span>
                    <span className="cstat-lbl">Posts</span>
                  </div>
                  <div className="cstat">
                    <span className="cstat-num">😴</span>
                    <span className="cstat-lbl">Mood</span>
                  </div>
                  <div className="cstat">
                    <span className="cstat-num">💛</span>
                    <span className="cstat-lbl">Energy</span>
                  </div>
                </div>
                <div className="card-vibe vibe-yellow">
                  "Lazy indoors. Rocket outdoors. 0 to 40mph in 2 seconds."
                </div>
                <div className="card-desc">
                  Spends 22 hours horizontal. The other 2? Pure greyhound terror.
                </div>
                <div className="card-cta cta-yellow">Visit Nela's page ☀️</div>
              </div>
            </Link>

            {/* SZOGUN */}
            <Link href="/dogs/szogun" className="dog-card szogun-card">
              <div className="card-photo-wrap">
                <Image
                    src="/photos/szogun/szogun-cow.jpg"
                    alt="Szogun"
                    width={360}
                    height={260}
                    className="card-real-img"
                />
              </div>
              <div className="colour-strip strip-green" />
              <div className="card-body">
                <div className="card-top">
                  <div className="card-name">Szogun</div>
                  <div className="cbadge cbadge-green">Schnauzer Mix</div>
                </div>
                <div className="card-breed">⚡ The chaos gremlin</div>
                <div className="card-stats">
                  <div className="cstat">
                    <span className="cstat-num">0</span>
                    <span className="cstat-lbl">Posts</span>
                  </div>
                  <div className="cstat">
                    <span className="cstat-num">😤</span>
                    <span className="cstat-lbl">Mood</span>
                  </div>
                  <div className="cstat">
                    <span className="cstat-num">💚</span>
                    <span className="cstat-lbl">Energy</span>
                  </div>
                </div>
                <div className="card-vibe vibe-green">
                  "Anxious. Energetic. Unstoppable. Beard game unmatched."
                </div>
                <div className="card-desc">
                  Active, anxious, and running on pure chaos energy. Szogun doesn't walk — he bounces.
                </div>
                <div className="card-cta cta-green">Visit Szogun's page ⚡</div>
              </div>
            </Link>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="site-footer">
          Made with 🐾 love · Paws & Tales
        </footer>
      </main>
  )
}