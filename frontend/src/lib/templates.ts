export const TEMPLATES = [
  {
    id: "glass-terminal",
    name: "Glass Terminal",
    style: "Dark Terminal",
    premium: false,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glass Terminal — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #060a12;
    --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(255,255,255,0.08);
    --green: #00ff88;
    --green-dim: rgba(0,255,136,0.12);
    --cyan: #00d4ff;
    --text: #e0e6f0;
    --muted: #4a5568;
    --card-bg: rgba(255,255,255,0.03);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Grid background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  /* Glow orb */
  body::after {
    content: '';
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
    top: -200px;
    right: -200px;
    pointer-events: none;
    z-index: 0;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }

  /* NAV */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(6,10,18,0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--glass-border);
    padding: 1rem 0;
  }

  nav .inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: var(--green);
    letter-spacing: 0.05em;
  }

  .logo span { color: var(--muted); }

  nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
  }

  nav a {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--muted);
    text-decoration: none;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  nav a:hover { color: var(--green); }

  /* HERO */
  .hero {
    padding: 12rem 0 8rem;
    position: relative;
  }

  .hero-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--green);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .hero-tag::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--green);
  }

  .hero h1 {
    font-size: clamp(3rem, 7vw, 6rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
  }

  .hero h1 em {
    font-style: normal;
    color: transparent;
    -webkit-text-stroke: 1px rgba(0,255,136,0.4);
  }

  .hero-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    color: #6b7280;
    max-width: 480px;
    line-height: 1.8;
    margin-bottom: 3rem;
  }

  .hero-desc .highlight { color: var(--cyan); }

  .hero-cta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn-primary {
    background: var(--green);
    color: #000;
    padding: 0.85rem 2rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: opacity 0.2s, transform 0.2s;
    display: inline-block;
  }

  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

  .btn-ghost {
    border: 1px solid var(--glass-border);
    color: var(--text);
    padding: 0.85rem 2rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: border-color 0.2s, color 0.2s;
    display: inline-block;
  }

  .btn-ghost:hover { border-color: var(--green); color: var(--green); }

  /* STATUS BAR */
  .status-bar {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-top: 5rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--glass-border);
    background: var(--card-bg);
    flex-wrap: wrap;
  }

  .status-item {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .status-label { color: var(--muted); }
  .status-value { color: var(--text); }

  /* SECTIONS */
  section { padding: 6rem 0; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .section-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--green);
    letter-spacing: 0.1em;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: var(--glass-border);
  }

  /* SKILLS */
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1px;
    background: var(--glass-border);
    border: 1px solid var(--glass-border);
  }

  .skill-card {
    background: var(--bg);
    padding: 1.5rem;
    transition: background 0.2s;
  }

  .skill-card:hover { background: var(--glass); }

  .skill-cat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--green);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .skill-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .skill-bar {
    height: 2px;
    background: var(--glass-border);
    margin-top: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .skill-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--green), var(--cyan));
    animation: fillBar 1.5s ease-out forwards;
    transform-origin: left;
  }

  @keyframes fillBar {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  /* PROJECTS */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1px;
    background: var(--glass-border);
    border: 1px solid var(--glass-border);
  }

  .project-card {
    background: var(--bg);
    padding: 2rem;
    transition: background 0.2s;
    position: relative;
    overflow: hidden;
  }

  .project-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--green), var(--cyan));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }

  .project-card:hover::before { transform: scaleX(1); }
  .project-card:hover { background: var(--card-bg); }

  .project-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--muted);
    margin-bottom: 1rem;
  }

  .project-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .project-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: #6b7280;
    line-height: 1.7;
    margin-bottom: 1.25rem;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--glass-border);
    color: var(--cyan);
    letter-spacing: 0.05em;
  }

  /* EXPERIENCE */
  .exp-list { display: flex; flex-direction: column; gap: 0; }

  .exp-item {
    border: 1px solid var(--glass-border);
    margin-bottom: -1px;
    padding: 1.75rem 2rem;
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 2rem;
    background: var(--bg);
    transition: background 0.2s;
  }

  .exp-item:hover { background: var(--card-bg); }

  .exp-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--muted);
    padding-top: 0.25rem;
  }

  .exp-role {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .exp-company {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: var(--green);
    margin-bottom: 0.75rem;
  }

  .exp-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: #6b7280;
    line-height: 1.7;
  }

  /* CONTACT */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--glass-border);
    border: 1px solid var(--glass-border);
  }

  .contact-item {
    background: var(--bg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-decoration: none;
    transition: background 0.2s;
  }

  .contact-item:hover { background: var(--card-bg); }

  .contact-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .contact-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
  }

  .contact-arrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: var(--green);
    margin-top: 0.25rem;
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--glass-border);
    padding: 2rem 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 640px) {
    .exp-item { grid-template-columns: 1fr; gap: 0.5rem; }
    .contact-grid { grid-template-columns: 1fr; }
    nav ul { display: none; }
  }
</style>
</head>
<body>

<nav>
  <div class="inner">
    <div class="logo"><span>~/</span>alex.chen<span>.dev</span></div>
    <ul>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#experience">Experience</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </div>
</nav>

<div class="container">

  <section class="hero">
    <p class="hero-tag">Software Engineer</p>
    <h1>Alex<br><em>Chen</em></h1>
    <p class="hero-desc">
      Building <span class="highlight">distributed systems</span> and developer tools that scale.<br>
      5 years shipping production code at companies that matter.
    </p>
    <div class="hero-cta">
      <a href="#projects" class="btn-primary">View Work</a>
      <a href="#contact" class="btn-ghost">Get in Touch</a>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-dot"></span>
        <span class="status-label">Status:</span>
        <span class="status-value">Open to roles</span>
      </div>
      <div class="status-item">
        <span class="status-label">Location:</span>
        <span class="status-value">San Francisco, CA</span>
      </div>
      <div class="status-item">
        <span class="status-label">Focus:</span>
        <span class="status-value">Backend · DevOps · APIs</span>
      </div>
      <div class="status-item">
        <span class="status-label">YOE:</span>
        <span class="status-value">5 years</span>
      </div>
    </div>
  </section>

  <section id="skills">
    <div class="section-header">
      <span class="section-num">01</span>
      <h2 class="section-title">Skills</h2>
      <div class="section-line"></div>
    </div>
    <div class="skills-grid">
      <div class="skill-card">
        <div class="skill-cat">Languages</div>
        <div class="skill-name">Go · Rust</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:92%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-cat">Languages</div>
        <div class="skill-name">Python · TypeScript</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:88%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-cat">Infrastructure</div>
        <div class="skill-name">Kubernetes · Docker</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:85%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-cat">Cloud</div>
        <div class="skill-name">AWS · GCP</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:80%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-cat">Databases</div>
        <div class="skill-name">PostgreSQL · Redis</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:90%"></div></div>
      </div>
      <div class="skill-card">
        <div class="skill-cat">Observability</div>
        <div class="skill-name">Prometheus · Grafana</div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:75%"></div></div>
      </div>
    </div>
  </section>

  <section id="projects">
    <div class="section-header">
      <span class="section-num">02</span>
      <h2 class="section-title">Projects</h2>
      <div class="section-line"></div>
    </div>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-num">// project_01</div>
        <div class="project-title">FluxDB</div>
        <p class="project-desc">A distributed time-series database written in Rust. Handles 2M writes/sec with sub-millisecond P99 latency. Used in production by 12 companies.</p>
        <div class="project-tags">
          <span class="tag">Rust</span>
          <span class="tag">Distributed Systems</span>
          <span class="tag">Raft</span>
        </div>
      </div>
      <div class="project-card">
        <div class="project-num">// project_02</div>
        <div class="project-title">Kaizen CI</div>
        <p class="project-desc">Open-source CI/CD pipeline tool with intelligent test parallelisation and ML-based flake detection. 4.2k GitHub stars.</p>
        <div class="project-tags">
          <span class="tag">Go</span>
          <span class="tag">Kubernetes</span>
          <span class="tag">gRPC</span>
        </div>
      </div>
      <div class="project-card">
        <div class="project-num">// project_03</div>
        <div class="project-title">Aperture API</div>
        <p class="project-desc">Rate-limiting and quota management service as a sidecar. Plugs into any microservice stack via Envoy filter. Zero-config deployments.</p>
        <div class="project-tags">
          <span class="tag">TypeScript</span>
          <span class="tag">Envoy</span>
          <span class="tag">Redis</span>
        </div>
      </div>
    </div>
  </section>

  <section id="experience">
    <div class="section-header">
      <span class="section-num">03</span>
      <h2 class="section-title">Experience</h2>
      <div class="section-line"></div>
    </div>
    <div class="exp-list">
      <div class="exp-item">
        <div class="exp-date">2022 — Present</div>
        <div>
          <div class="exp-role">Senior Software Engineer</div>
          <div class="exp-company">Stripe</div>
          <p class="exp-desc">Led backend architecture for payment routing engine processing $4B daily. Reduced P99 latency by 40% through query optimisation and caching layers.</p>
        </div>
      </div>
      <div class="exp-item">
        <div class="exp-date">2020 — 2022</div>
        <div>
          <div class="exp-role">Software Engineer II</div>
          <div class="exp-company">Datadog</div>
          <p class="exp-desc">Built ingestion pipeline for metrics processing 10TB/day. Owned on-call rotation for core infrastructure serving 15,000 customers.</p>
        </div>
      </div>
      <div class="exp-item">
        <div class="exp-date">2019 — 2020</div>
        <div>
          <div class="exp-role">Software Engineer</div>
          <div class="exp-company">Cloudflare</div>
          <p class="exp-desc">Developed edge-computing runtimes for Workers platform. Contributed to open-source toolchain adopted by 50k+ developers.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="contact">
    <div class="section-header">
      <span class="section-num">04</span>
      <h2 class="section-title">Contact</h2>
      <div class="section-line"></div>
    </div>
    <div class="contact-grid">
      <a href="mailto:alex@chen.dev" class="contact-item">
        <span class="contact-label">Email</span>
        <span class="contact-value">alex@chen.dev</span>
        <span class="contact-arrow">→ send message</span>
      </a>
      <a href="#" class="contact-item">
        <span class="contact-label">GitHub</span>
        <span class="contact-value">github.com/alexchen</span>
        <span class="contact-arrow">→ view repos</span>
      </a>
      <a href="#" class="contact-item">
        <span class="contact-label">LinkedIn</span>
        <span class="contact-value">linkedin.com/in/alexchen</span>
        <span class="contact-arrow">→ connect</span>
      </a>
      <a href="#" class="contact-item">
        <span class="contact-label">Resume</span>
        <span class="contact-value">alex_chen_cv.pdf</span>
        <span class="contact-arrow">→ download</span>
      </a>
    </div>
  </section>

  <footer>
    <span>© 2025 Alex Chen</span>
    <span>Built with intention.</span>
  </footer>

</div>
</body>
</html>
`,
  },
  {
    id: "brutalist-grid",
    name: "Brutalist Grid",
    style: "Bold & Structural",
    premium: false,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brutalist Grid — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --black: #0a0a0a;
    --white: #f5f0e8;
    --accent: #ff3d00;
    --yellow: #ffdd00;
    --grid: rgba(0,0,0,0.06);
  }

  body {
    background: var(--white);
    color: var(--black);
    font-family: 'Space Grotesk', sans-serif;
    overflow-x: hidden;
  }

  /* HEADER / NAV */
  header {
    border-bottom: 3px solid var(--black);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0;
    position: sticky;
    top: 0;
    background: var(--white);
    z-index: 100;
  }

  .nav-left {
    border-right: 3px solid var(--black);
    padding: 1.25rem 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .nav-center {
    padding: 1.25rem 3rem;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .nav-right {
    border-left: 3px solid var(--black);
    padding: 0;
    display: flex;
  }

  .nav-right a {
    padding: 1.25rem 1.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--black);
    border-right: 1px solid rgba(0,0,0,0.1);
    transition: background 0.15s;
  }

  .nav-right a:last-child { border-right: none; }
  .nav-right a:hover { background: var(--yellow); }

  /* HERO */
  .hero {
    border-bottom: 3px solid var(--black);
    display: grid;
    grid-template-columns: 1fr 420px;
    min-height: 85vh;
  }

  .hero-left {
    border-right: 3px solid var(--black);
    padding: 4rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 3rem;
  }

  .eyebrow-dash {
    width: 30px;
    height: 2px;
    background: var(--accent);
  }

  .hero-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(5rem, 12vw, 11rem);
    line-height: 0.9;
    letter-spacing: 0.01em;
    margin-bottom: 3rem;
  }

  .hero-name .invert {
    color: var(--white);
    -webkit-text-stroke: 2px var(--black);
  }

  .hero-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 2px solid var(--black);
  }

  .meta-cell {
    padding: 1.25rem;
    border-right: 1px solid var(--black);
    border-bottom: 1px solid var(--black);
  }

  .meta-cell:nth-child(even) { border-right: none; }
  .meta-cell:nth-last-child(-n+2) { border-bottom: none; }

  .meta-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 0.35rem;
  }

  .meta-val {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .hero-right {
    padding: 4rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    background: var(--black);
    color: var(--white);
  }

  .hero-tagline {
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1.5;
  }

  .hero-tagline strong { font-weight: 700; }

  .available-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--yellow);
    color: var(--black);
    padding: 0.6rem 1.2rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    width: fit-content;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--black);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .hero-cta-stack {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 2px solid rgba(255,255,255,0.2);
  }

  .cta-row {
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    text-decoration: none;
    color: var(--white);
    transition: background 0.15s;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .cta-row:last-child { border-bottom: none; }
  .cta-row:hover { background: rgba(255,255,255,0.08); }

  .cta-arrow { color: var(--yellow); font-size: 1.1rem; }

  /* TICKER */
  .ticker {
    background: var(--accent);
    overflow: hidden;
    border-bottom: 3px solid var(--black);
    padding: 0.75rem 0;
    white-space: nowrap;
  }

  .ticker-inner {
    display: inline-block;
    animation: ticker 18s linear infinite;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    color: var(--white);
  }

  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .ticker-sep { margin: 0 1.5rem; opacity: 0.5; }

  /* SKILLS SECTION */
  .skills-section {
    border-bottom: 3px solid var(--black);
  }

  .section-masthead {
    border-bottom: 3px solid var(--black);
    padding: 1.5rem 3rem;
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
  }

  .masthead-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem;
    color: var(--accent);
    letter-spacing: 0.1em;
  }

  .masthead-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .skills-body {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-left: none;
  }

  .skill-block {
    border-right: 1px solid var(--black);
    border-bottom: 1px solid var(--black);
    padding: 2rem 1.5rem;
    transition: background 0.15s;
    cursor: default;
  }

  .skill-block:hover { background: var(--yellow); }

  .skill-block-cat {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 1rem;
  }

  .skill-block-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    letter-spacing: 0.05em;
    line-height: 1.1;
    margin-bottom: 0.75rem;
  }

  .skill-level {
    display: flex;
    gap: 3px;
  }

  .level-pip {
    width: 8px;
    height: 8px;
    background: var(--black);
  }

  .level-pip.empty { background: transparent; border: 1px solid #ccc; }

  /* PROJECTS SECTION */
  .projects-section { border-bottom: 3px solid var(--black); }

  .projects-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .project-block {
    border-right: 1px solid var(--black);
    border-bottom: 1px solid var(--black);
    padding: 2.5rem 3rem;
    transition: background 0.15s;
  }

  .project-block:nth-child(even) { border-right: none; }

  .project-block:hover { background: #f0ebe0; }

  .proj-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 4rem;
    color: rgba(0,0,0,0.06);
    line-height: 1;
    margin-bottom: -1rem;
  }

  .proj-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .proj-desc {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  .proj-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .stack-pill {
    background: var(--black);
    color: var(--white);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.3rem 0.7rem;
  }

  /* EXPERIENCE SECTION */
  .experience-section { border-bottom: 3px solid var(--black); }

  .exp-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
  }

  .exp-index {
    border-right: 3px solid var(--black);
    padding: 0;
  }

  .exp-index-item {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: background 0.15s;
  }

  .exp-index-item.active { background: var(--black); color: var(--white); }
  .exp-index-item:hover:not(.active) { background: var(--yellow); }

  .exp-index-company {
    font-weight: 700;
    margin-bottom: 0.2rem;
  }

  .exp-index-years { font-size: 0.72rem; color: inherit; opacity: 0.6; }

  .exp-detail {
    padding: 3rem;
  }

  .exp-detail-role {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    letter-spacing: 0.03em;
    margin-bottom: 0.5rem;
  }

  .exp-detail-company {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }

  .exp-detail-bullets {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .exp-detail-bullets li {
    font-size: 0.9rem;
    line-height: 1.7;
    color: #444;
    padding-left: 1.25rem;
    position: relative;
  }

  .exp-detail-bullets li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--accent);
    font-weight: 700;
  }

  /* FOOTER */
  footer {
    background: var(--black);
    color: var(--white);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 3px solid var(--black);
  }

  .footer-cell {
    padding: 3rem;
    border-right: 1px solid rgba(255,255,255,0.1);
  }

  .footer-cell:last-child { border-right: none; }

  .footer-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 1rem;
  }

  .footer-big {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 0.05em;
  }

  .footer-link {
    font-size: 0.9rem;
    color: #aaa;
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;
    transition: color 0.15s;
  }

  .footer-link:hover { color: var(--yellow); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; }
    .hero-right { min-height: 50vh; }
    .skills-body { grid-template-columns: repeat(3, 1fr); }
    .projects-body { grid-template-columns: 1fr; }
    .exp-grid { grid-template-columns: 1fr; }
    .footer { grid-template-columns: 1fr; }
    header { grid-template-columns: 1fr; }
    .nav-right { flex-wrap: wrap; border-left: none; border-top: 1px solid rgba(0,0,0,0.1); }
  }
</style>
</head>
<body>

<header>
  <div class="nav-left">Software Engineer Portfolio</div>
  <div class="nav-center">Jordan M.</div>
  <div class="nav-right">
    <a href="#skills">Skills</a>
    <a href="#projects">Work</a>
    <a href="#experience">Exp</a>
    <a href="#contact">Contact</a>
  </div>
</header>

<section class="hero">
  <div class="hero-left">
    <div>
      <div class="hero-eyebrow">
        <div class="eyebrow-dash"></div>
        Full-Stack Engineer
      </div>
      <div class="hero-name">
        Jordan<br>
        <span class="invert">Miles</span>
      </div>
    </div>
    <div class="hero-meta">
      <div class="meta-cell">
        <div class="meta-label">Location</div>
        <div class="meta-val">New York, USA</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Experience</div>
        <div class="meta-val">7 Years</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Focus</div>
        <div class="meta-val">React · Node · AWS</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Education</div>
        <div class="meta-val">MIT CS '17</div>
      </div>
    </div>
  </div>
  <div class="hero-right">
    <div class="available-badge">
      <div class="badge-dot"></div>
      Available — Q1 2025
    </div>
    <p class="hero-tagline">
      I build <strong>products people love</strong> using modern web technology. Obsessed with performance, DX, and shipping fast.
    </p>
    <div class="hero-cta-stack">
      <a href="#projects" class="cta-row">View selected work <span class="cta-arrow">↓</span></a>
      <a href="#" class="cta-row">Download resume <span class="cta-arrow">↗</span></a>
      <a href="mailto:jordan@miles.dev" class="cta-row">Send an email <span class="cta-arrow">→</span></a>
    </div>
  </div>
</section>

<div class="ticker">
  <span class="ticker-inner">
    React &nbsp;<span class="ticker-sep">×</span>&nbsp; TypeScript &nbsp;<span class="ticker-sep">×</span>&nbsp; Node.js &nbsp;<span class="ticker-sep">×</span>&nbsp; AWS &nbsp;<span class="ticker-sep">×</span>&nbsp; PostgreSQL &nbsp;<span class="ticker-sep">×</span>&nbsp; GraphQL &nbsp;<span class="ticker-sep">×</span>&nbsp; Docker &nbsp;<span class="ticker-sep">×</span>&nbsp; CI/CD &nbsp;<span class="ticker-sep">×</span>&nbsp; System Design &nbsp;<span class="ticker-sep">×</span>&nbsp; Open Source &nbsp;<span class="ticker-sep">×</span>&nbsp; React &nbsp;<span class="ticker-sep">×</span>&nbsp; TypeScript &nbsp;<span class="ticker-sep">×</span>&nbsp; Node.js &nbsp;<span class="ticker-sep">×</span>&nbsp; AWS &nbsp;<span class="ticker-sep">×</span>&nbsp; PostgreSQL &nbsp;<span class="ticker-sep">×</span>&nbsp; GraphQL &nbsp;<span class="ticker-sep">×</span>&nbsp; Docker &nbsp;<span class="ticker-sep">×</span>&nbsp; CI/CD &nbsp;<span class="ticker-sep">×</span>&nbsp; System Design &nbsp;<span class="ticker-sep">×</span>&nbsp; Open Source &nbsp;&nbsp;
  </span>
</div>

<section class="skills-section" id="skills">
  <div class="section-masthead">
    <span class="masthead-num">01 —</span>
    <span class="masthead-title">Technical Skills</span>
  </div>
  <div class="skills-body">
    <div class="skill-block">
      <div class="skill-block-cat">Frontend</div>
      <div class="skill-block-name">React / Next.js</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip empty"></div>
      </div>
    </div>
    <div class="skill-block">
      <div class="skill-block-cat">Language</div>
      <div class="skill-block-name">TypeScript</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div>
      </div>
    </div>
    <div class="skill-block">
      <div class="skill-block-cat">Backend</div>
      <div class="skill-block-name">Node / Express</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip empty"></div>
      </div>
    </div>
    <div class="skill-block">
      <div class="skill-block-cat">Cloud</div>
      <div class="skill-block-name">AWS / GCP</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip empty"></div><div class="level-pip empty"></div>
      </div>
    </div>
    <div class="skill-block">
      <div class="skill-block-cat">Database</div>
      <div class="skill-block-name">PostgreSQL</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip empty"></div>
      </div>
    </div>
    <div class="skill-block">
      <div class="skill-block-cat">API</div>
      <div class="skill-block-name">GraphQL / REST</div>
      <div class="skill-level">
        <div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div><div class="level-pip"></div>
      </div>
    </div>
  </div>
</section>

<section class="projects-section" id="projects">
  <div class="section-masthead">
    <span class="masthead-num">02 —</span>
    <span class="masthead-title">Selected Work</span>
  </div>
  <div class="projects-body">
    <div class="project-block">
      <div class="proj-number">01</div>
      <div class="proj-title">Meridian Dashboard</div>
      <p class="proj-desc">Real-time analytics platform for e-commerce. Processes 500K events/day with live charts, cohort analysis, and A/B test reporting. Reduced decision cycle from days to hours.</p>
      <div class="proj-stack">
        <span class="stack-pill">React</span>
        <span class="stack-pill">TypeScript</span>
        <span class="stack-pill">D3.js</span>
        <span class="stack-pill">Kafka</span>
      </div>
    </div>
    <div class="project-block">
      <div class="proj-number">02</div>
      <div class="proj-title">Vault Auth SDK</div>
      <p class="proj-desc">Open-source authentication library with passwordless login, SSO, and MFA. 8k npm downloads/week. Zero-dependency core with optional adapters for every major framework.</p>
      <div class="proj-stack">
        <span class="stack-pill">TypeScript</span>
        <span class="stack-pill">WebAuthn</span>
        <span class="stack-pill">JWT</span>
      </div>
    </div>
    <div class="project-block">
      <div class="proj-number">03</div>
      <div class="proj-title">Nomad CMS</div>
      <p class="proj-desc">Headless CMS with visual block editor and GraphQL API. Powers 200+ marketing sites. Plugin system supports custom content types without code changes.</p>
      <div class="proj-stack">
        <span class="stack-pill">Next.js</span>
        <span class="stack-pill">GraphQL</span>
        <span class="stack-pill">PostgreSQL</span>
      </div>
    </div>
    <div class="project-block">
      <div class="proj-number">04</div>
      <div class="proj-title">Collab.io</div>
      <p class="proj-desc">Real-time collaborative whiteboarding tool with OT-based conflict resolution. Supports 50 concurrent users per room with sub-50ms sync latency.</p>
      <div class="proj-stack">
        <span class="stack-pill">React</span>
        <span class="stack-pill">WebSockets</span>
        <span class="stack-pill">CRDT</span>
        <span class="stack-pill">Canvas</span>
      </div>
    </div>
  </div>
</section>

<section class="experience-section" id="experience">
  <div class="section-masthead">
    <span class="masthead-num">03 —</span>
    <span class="masthead-title">Experience</span>
  </div>
  <div class="exp-grid">
    <div class="exp-index">
      <div class="exp-index-item active">
        <div class="exp-index-company">Vercel</div>
        <div class="exp-index-years">2022–Present</div>
      </div>
      <div class="exp-index-item">
        <div class="exp-index-company">Shopify</div>
        <div class="exp-index-years">2020–2022</div>
      </div>
      <div class="exp-index-item">
        <div class="exp-index-company">Palantir</div>
        <div class="exp-index-years">2017–2020</div>
      </div>
    </div>
    <div class="exp-detail">
      <div class="exp-detail-role">Senior Software Engineer</div>
      <div class="exp-detail-company">Vercel · 2022–Present</div>
      <ul class="exp-detail-bullets">
        <li>Led development of Next.js App Router, now used by 800k+ projects worldwide.</li>
        <li>Reduced cold-start times by 60% through edge runtime optimisations and module bundling improvements.</li>
        <li>Shipped the visual deployment diff tool used in 3M+ preview deployments monthly.</li>
        <li>Mentored 4 junior engineers; established frontend performance review process adopted org-wide.</li>
      </ul>
    </div>
  </div>
</section>

<footer id="contact">
  <div class="footer-cell">
    <div class="footer-label">Let's build something</div>
    <div class="footer-big">Jordan Miles</div>
  </div>
  <div class="footer-cell">
    <div class="footer-label">Connect</div>
    <a href="mailto:jordan@miles.dev" class="footer-link">jordan@miles.dev</a>
    <a href="#" class="footer-link">github.com/jordanmiles</a>
    <a href="#" class="footer-link">linkedin.com/in/jordanmiles</a>
  </div>
  <div class="footer-cell">
    <div class="footer-label">Currently</div>
    <p style="font-size:0.9rem; color:#aaa; line-height:1.7">Open to senior / staff eng roles at product companies. Based in NYC, open to remote.</p>
  </div>
</footer>

</body>
</html>
`,
  },
  {
    id: "aurora-luxury",
    name: "Aurora Luxury",
    style: "Gradient Premium",
    premium: true,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aurora — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #08090d;
    --surface: #0f111a;
    --surface2: #141721;
    --border: rgba(255,255,255,0.07);
    --text: #e8eaf0;
    --muted: #5a6070;
    --a1: #a78bfa;
    --a2: #60a5fa;
    --a3: #34d399;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Aurora background blob */
  .aurora-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .aurora-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.12;
  }

  .blob1 {
    width: 700px;
    height: 700px;
    background: var(--a1);
    top: -200px;
    left: -200px;
    animation: drift1 20s ease-in-out infinite alternate;
  }

  .blob2 {
    width: 500px;
    height: 500px;
    background: var(--a2);
    bottom: 0;
    right: -100px;
    animation: drift2 25s ease-in-out infinite alternate;
  }

  .blob3 {
    width: 400px;
    height: 400px;
    background: var(--a3);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: drift3 18s ease-in-out infinite alternate;
  }

  @keyframes drift1 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(80px, 80px) scale(1.1); }
  }

  @keyframes drift2 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-60px, -60px) scale(1.15); }
  }

  @keyframes drift3 {
    0% { transform: translate(-50%, -50%) scale(1); }
    100% { transform: translate(-40%, -60%) scale(0.9); }
  }

  .wrap {
    position: relative;
    z-index: 1;
  }

  /* NAV */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 1.5rem 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(8,9,13,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }

  .nav-brand {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    letter-spacing: 0.02em;
  }

  .nav-links {
    display: flex;
    gap: 2.5rem;
    list-style: none;
  }

  .nav-links a {
    font-size: 0.82rem;
    color: var(--muted);
    text-decoration: none;
    font-weight: 400;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .nav-links a:hover { color: var(--text); }

  .nav-cta {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--bg);
    background: var(--text);
    padding: 0.6rem 1.4rem;
    text-decoration: none;
    border-radius: 100px;
    transition: opacity 0.2s;
  }

  .nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10rem 3rem 6rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .hero-role {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 2rem;
    border: 1px solid var(--border);
    padding: 0.5rem 1.2rem;
    border-radius: 100px;
    width: fit-content;
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,0.03);
  }

  .role-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--a3);
    flex-shrink: 0;
    box-shadow: 0 0 8px var(--a3);
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(3.5rem, 8vw, 7rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 2rem;
  }

  .hero h1 .gradient-text {
    background: linear-gradient(135deg, var(--a1), var(--a2), var(--a3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 1.2rem;
    color: var(--muted);
    font-weight: 300;
    max-width: 520px;
    line-height: 1.8;
    margin-bottom: 3.5rem;
  }

  .hero-sub em {
    font-style: italic;
    color: var(--text);
    font-family: 'DM Serif Display', serif;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-aurora {
    background: linear-gradient(135deg, var(--a1), var(--a2));
    color: #fff;
    padding: 0.9rem 2.2rem;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
  }

  .btn-aurora:hover { opacity: 0.88; transform: translateY(-2px); }

  .btn-outline {
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0.9rem 2.2rem;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 400;
    text-decoration: none;
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,0.03);
    transition: border-color 0.2s;
  }

  .btn-outline:hover { border-color: rgba(255,255,255,0.2); }

  .hero-stats {
    display: flex;
    gap: 3rem;
    margin-top: 4rem;
    padding-top: 4rem;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .stat-item {}

  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem;
    font-weight: 400;
    line-height: 1;
    background: linear-gradient(135deg, var(--a1), var(--a2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.3rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--muted);
    font-weight: 400;
    letter-spacing: 0.05em;
  }

  /* CONTENT */
  .content-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 6rem 3rem;
  }

  .section-label {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--a1);
    margin-bottom: 1rem;
  }

  .section-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem;
    font-weight: 400;
    margin-bottom: 3rem;
    letter-spacing: -0.01em;
  }

  /* SKILLS */
  .skills-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .skill-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    transition: border-color 0.2s, transform 0.2s;
  }

  .skill-item:hover {
    border-color: rgba(167,139,250,0.3);
    transform: translateY(-2px);
  }

  .skill-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .skill-icon.purple { background: rgba(167,139,250,0.15); }
  .skill-icon.blue { background: rgba(96,165,250,0.15); }
  .skill-icon.green { background: rgba(52,211,153,0.15); }

  .skill-name {
    font-size: 1.05rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .skill-desc {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.7;
  }

  /* PROJECTS */
  .projects-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .proj-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: start;
    transition: border-color 0.2s, transform 0.2s;
    text-decoration: none;
    color: inherit;
  }

  .proj-card:hover {
    border-color: rgba(167,139,250,0.3);
    transform: translateY(-2px);
  }

  .proj-meta {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .proj-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.75rem;
    font-weight: 400;
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  .proj-body {
    font-size: 0.9rem;
    color: var(--muted);
    line-height: 1.75;
    margin-bottom: 1.25rem;
  }

  .proj-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .proj-tag {
    font-size: 0.72rem;
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
    background: rgba(255,255,255,0.05);
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .proj-link-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: border-color 0.2s, color 0.2s;
  }

  .proj-card:hover .proj-link-icon {
    border-color: var(--a1);
    color: var(--a1);
  }

  /* EXPERIENCE */
  .exp-timeline {
    position: relative;
    padding-left: 2rem;
  }

  .exp-timeline::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, var(--a1), transparent);
  }

  .exp-entry {
    position: relative;
    padding-bottom: 3rem;
  }

  .exp-entry::before {
    content: '';
    position: absolute;
    left: -2rem;
    top: 8px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--a1);
    transform: translateX(-3px);
    box-shadow: 0 0 12px var(--a1);
  }

  .exp-period {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
  }

  .exp-role {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    font-weight: 400;
    margin-bottom: 0.25rem;
  }

  .exp-co {
    font-size: 0.85rem;
    color: var(--a2);
    font-weight: 500;
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
  }

  .exp-body {
    font-size: 0.88rem;
    color: var(--muted);
    line-height: 1.8;
  }

  /* CONTACT */
  .contact-wrap {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 8rem 3rem;
  }

  .contact-wrap .section-label { justify-content: center; display: flex; }

  .contact-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 400;
    line-height: 1.15;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .contact-heading .italic { font-style: italic; color: var(--a1); }

  .contact-sub {
    font-size: 1rem;
    color: var(--muted);
    line-height: 1.8;
    margin-bottom: 3rem;
  }

  .contact-email {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: var(--text);
    text-decoration: none;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.25rem;
    transition: border-color 0.2s;
  }

  .contact-email:hover { border-color: var(--a1); }

  .contact-links {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-top: 2.5rem;
  }

  .c-link {
    font-size: 0.82rem;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .c-link:hover { color: var(--text); }
</style>
</head>
<body>

<div class="aurora-bg">
  <div class="aurora-blob blob1"></div>
  <div class="aurora-blob blob2"></div>
  <div class="aurora-blob blob3"></div>
</div>

<div class="wrap">
  <nav>
    <div class="nav-brand">Priya Nair</div>
    <ul class="nav-links">
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#experience">Experience</a></li>
    </ul>
    <a href="mailto:priya@nair.io" class="nav-cta">Hire me</a>
  </nav>

  <section class="hero">
    <div class="hero-role">
      <span class="role-dot"></span>
      Senior Software Engineer · Open to Opportunities
    </div>
    <h1>Building software<br>that <span class="gradient-text">scales</span> beautifully.</h1>
    <p class="hero-sub">
      Hi, I'm <em>Priya Nair</em> — a backend engineer with a love for distributed systems, elegant APIs, and developer experience done right.
    </p>
    <div class="hero-actions">
      <a href="#projects" class="btn-aurora">See my work</a>
      <a href="#" class="btn-outline">Download CV ↗</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item">
        <div class="stat-num">6+</div>
        <div class="stat-label">Years experience</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">24</div>
        <div class="stat-label">Projects shipped</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">3</div>
        <div class="stat-label">Open source tools</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">∞</div>
        <div class="stat-label">Bugs fixed</div>
      </div>
    </div>
  </section>

  <section class="content-section" id="skills">
    <div class="section-label">What I work with</div>
    <h2 class="section-heading">Core Skills</h2>
    <div class="skills-list">
      <div class="skill-item">
        <div class="skill-icon purple">⚡</div>
        <div class="skill-name">Backend Engineering</div>
        <p class="skill-desc">Python, Go, Java. Microservices, REST & GraphQL APIs, message queues, async processing. Strong focus on reliability and observability.</p>
      </div>
      <div class="skill-item">
        <div class="skill-icon blue">☁️</div>
        <div class="skill-name">Cloud & DevOps</div>
        <p class="skill-desc">AWS (ECS, Lambda, RDS, S3), GCP. Terraform for IaC, Docker, Kubernetes, CI/CD with GitHub Actions and ArgoCD.</p>
      </div>
      <div class="skill-item">
        <div class="skill-icon green">🗄️</div>
        <div class="skill-name">Data & Storage</div>
        <p class="skill-desc">PostgreSQL, DynamoDB, Redis, Elasticsearch. Data modelling, query optimisation, caching strategies for high-traffic systems.</p>
      </div>
      <div class="skill-item">
        <div class="skill-icon purple">🔒</div>
        <div class="skill-name">Security & Auth</div>
        <p class="skill-desc">OAuth 2.0, JWT, mTLS, RBAC. Security-first design for consumer and enterprise applications.</p>
      </div>
      <div class="skill-item">
        <div class="skill-icon blue">📊</div>
        <div class="skill-name">Observability</div>
        <p class="skill-desc">OpenTelemetry, Datadog, PagerDuty. Building systems with structured logging, distributed tracing, and meaningful SLOs.</p>
      </div>
      <div class="skill-item">
        <div class="skill-icon green">🧪</div>
        <div class="skill-name">Testing</div>
        <p class="skill-desc">Unit, integration, contract & load testing. Test-driven development advocate with experience in pytest, JUnit, k6, and Pact.</p>
      </div>
    </div>
  </section>

  <section class="content-section" id="projects">
    <div class="section-label">Recent work</div>
    <h2 class="section-heading">Selected Projects</h2>
    <div class="projects-stack">
      <a href="#" class="proj-card">
        <div>
          <div class="proj-meta">2024 · API Infrastructure</div>
          <div class="proj-title">Nexus Gateway</div>
          <p class="proj-body">A high-performance API gateway written in Go. Features intelligent routing, circuit-breaking, rate limiting, and request tracing. Handles 150k req/sec in production with 99.99% uptime.</p>
          <div class="proj-tags">
            <span class="proj-tag">Go</span>
            <span class="proj-tag">gRPC</span>
            <span class="proj-tag">Redis</span>
            <span class="proj-tag">Kubernetes</span>
            <span class="proj-tag">Prometheus</span>
          </div>
        </div>
        <div class="proj-link-icon">↗</div>
      </a>
      <a href="#" class="proj-card">
        <div>
          <div class="proj-meta">2023 · Developer Tools</div>
          <div class="proj-title">SchemaForge</div>
          <p class="proj-body">CLI tool for generating type-safe API clients from OpenAPI specs. Supports TypeScript, Go, and Python. Saves teams hours of boilerplate. 6k GitHub stars.</p>
          <div class="proj-tags">
            <span class="proj-tag">Python</span>
            <span class="proj-tag">OpenAPI</span>
            <span class="proj-tag">CLI</span>
            <span class="proj-tag">Open Source</span>
          </div>
        </div>
        <div class="proj-link-icon">↗</div>
      </a>
      <a href="#" class="proj-card">
        <div>
          <div class="proj-meta">2023 · Platform</div>
          <div class="proj-title">Quorum Events</div>
          <p class="proj-body">Distributed event sourcing platform with CQRS pattern. Built for fintech compliance — full audit trail, event replay, and temporal queries over billions of records.</p>
          <div class="proj-tags">
            <span class="proj-tag">Java</span>
            <span class="proj-tag">Kafka</span>
            <span class="proj-tag">EventStore</span>
            <span class="proj-tag">DynamoDB</span>
          </div>
        </div>
        <div class="proj-link-icon">↗</div>
      </a>
    </div>
  </section>

  <section class="content-section" id="experience">
    <div class="section-label">Where I've worked</div>
    <h2 class="section-heading">Experience</h2>
    <div class="exp-timeline">
      <div class="exp-entry">
        <div class="exp-period">2022 — Present</div>
        <div class="exp-role">Staff Software Engineer</div>
        <div class="exp-co">Plaid · San Francisco</div>
        <p class="exp-body">Technical lead for core bank connectivity infrastructure. Designed fault-tolerant sync architecture handling 4M daily financial data pulls. Led migration from monolith to event-driven microservices, reducing incident rate by 70%.</p>
      </div>
      <div class="exp-entry">
        <div class="exp-period">2020 — 2022</div>
        <div class="exp-role">Senior Engineer</div>
        <div class="exp-co">Twilio · Remote</div>
        <p class="exp-body">Built webhook delivery system guaranteeing at-least-once semantics at scale. Reduced failed delivery rate from 0.3% to 0.01%. Led API v3 design with 40+ breaking changes managed via versioning strategy.</p>
      </div>
      <div class="exp-entry">
        <div class="exp-period">2018 — 2020</div>
        <div class="exp-role">Software Engineer</div>
        <div class="exp-co">Amazon Web Services · Seattle</div>
        <p class="exp-body">Worked on Lambda execution environment team. Contributed to cold-start reduction initiative that improved median init time by 300ms for Node.js runtimes across all AWS regions.</p>
      </div>
    </div>
  </section>

  <div class="contact-wrap" id="contact">
    <div class="section-label">Get in touch</div>
    <h2 class="contact-heading">Ready to build<br>something <span class="italic">great?</span></h2>
    <p class="contact-sub">Whether you have a role in mind, a technical challenge to solve, or just want to connect — my inbox is open.</p>
    <a href="mailto:priya@nair.io" class="contact-email">priya@nair.io</a>
    <div class="contact-links">
      <a href="#" class="c-link">GitHub</a>
      <a href="#" class="c-link">LinkedIn</a>
      <a href="#" class="c-link">Twitter</a>
      <a href="#" class="c-link">Resume PDF</a>
    </div>
  </div>
</div>

</body>
</html>
`,
  },
  {
    id: "swiss-precision",
    name: "Swiss Precision",
    style: "Sidebar Layout",
    premium: true,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Swiss Precision — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300;400;700;900&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --ink: #0f0f0f;
    --paper: #f7f4ef;
    --paper2: #ede9e1;
    --red: #e5182c;
    --blue: #0050ff;
    --muted: #8a8070;
    --light: #c8c0b0;
  }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'Instrument Sans', sans-serif;
    overflow-x: hidden;
  }

  /* SIDEBAR LAYOUT */
  .layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
  }

  /* SIDEBAR */
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 3rem 2.5rem;
    gap: 3rem;
  }

  .sidebar-top { flex: 1; }

  .sidebar-mark {
    width: 36px;
    height: 36px;
    background: var(--red);
    margin-bottom: 3rem;
  }

  .sidebar-name {
    font-family: 'Unbounded', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.01em;
    margin-bottom: 0.5rem;
  }

  .sidebar-title {
    font-size: 0.78rem;
    color: rgba(247,244,239,0.4);
    font-weight: 400;
    letter-spacing: 0.05em;
    margin-bottom: 3rem;
  }

  .sidebar-nav {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.7rem 1rem;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: rgba(247,244,239,0.45);
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
  }

  .sidebar-nav a:hover {
    color: var(--paper);
    background: rgba(255,255,255,0.06);
  }

  .nav-line {
    width: 16px;
    height: 1px;
    background: currentColor;
    flex-shrink: 0;
  }

  .sidebar-info {
    font-size: 0.72rem;
    color: rgba(247,244,239,0.25);
    line-height: 1.7;
  }

  .sidebar-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    color: #4ade80;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #4ade80;
    animation: blink 2s infinite;
    flex-shrink: 0;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* MAIN CONTENT */
  main { overflow: hidden; }

  /* HERO */
  .hero-block {
    border-bottom: 1px solid var(--light);
    padding: 5rem 4rem;
    position: relative;
    overflow: hidden;
  }

  .hero-block::before {
    content: attr(data-bg-text);
    position: absolute;
    right: -1rem;
    bottom: -2rem;
    font-family: 'Unbounded', sans-serif;
    font-size: 14rem;
    font-weight: 900;
    color: rgba(0,0,0,0.04);
    line-height: 1;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.05em;
    white-space: nowrap;
  }

  .hero-eyebrow {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .eyebrow-mark {
    width: 8px;
    height: 8px;
    background: var(--red);
    flex-shrink: 0;
  }

  .hero-h1 {
    font-family: 'Unbounded', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin-bottom: 2.5rem;
    max-width: 600px;
  }

  .hero-h1 .line-blue { color: var(--blue); }

  .hero-summary {
    font-size: 1.05rem;
    color: var(--muted);
    line-height: 1.85;
    max-width: 480px;
    margin-bottom: 3rem;
    font-weight: 400;
  }

  .hero-cta-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn-ink {
    background: var(--ink);
    color: var(--paper);
    padding: 0.85rem 2rem;
    font-family: 'Unbounded', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s;
  }

  .btn-ink:hover { background: var(--blue); }

  .btn-border {
    border: 1px solid var(--light);
    color: var(--ink);
    padding: 0.85rem 2rem;
    font-family: 'Unbounded', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.2s;
  }

  .btn-border:hover { border-color: var(--ink); }

  /* STATS ROW */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid var(--light);
  }

  .stat-cell {
    padding: 2rem 3rem;
    border-right: 1px solid var(--light);
  }

  .stat-cell:last-child { border-right: none; }

  .stat-num {
    font-family: 'Unbounded', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 0.35rem;
  }

  .stat-num.red { color: var(--red); }
  .stat-num.blue { color: var(--blue); }

  .stat-desc {
    font-size: 0.75rem;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  /* SECTION BLOCK */
  .section-block {
    border-bottom: 1px solid var(--light);
  }

  .section-header-row {
    display: grid;
    grid-template-columns: 3rem 1fr;
    align-items: start;
    border-bottom: 1px solid var(--light);
  }

  .section-index {
    padding: 1.5rem 0;
    text-align: center;
    border-right: 1px solid var(--light);
    font-family: 'Unbounded', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--red);
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .section-title-wrap {
    padding: 2rem 4rem;
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
  }

  .section-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .section-count {
    font-size: 0.75rem;
    color: var(--muted);
    font-family: 'Unbounded', sans-serif;
  }

  /* SKILLS */
  .skills-columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 3rem 4rem;
    gap: 2rem;
  }

  .skill-group-label {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 1.25rem;
  }

  .skill-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .skill-list li {
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .skill-list li::before {
    content: '';
    width: 6px;
    height: 6px;
    background: var(--blue);
    flex-shrink: 0;
  }

  /* PROJECTS */
  .projects-list {
    padding: 0 4rem;
  }

  .proj-row {
    display: grid;
    grid-template-columns: 3.5rem 1fr auto;
    gap: 2.5rem;
    align-items: start;
    padding: 2.5rem 0;
    border-bottom: 1px solid var(--light);
    text-decoration: none;
    color: inherit;
    transition: background 0.2s;
  }

  .proj-row:last-child { border-bottom: none; }

  .proj-row:hover { background: none; }

  .proj-row:hover .proj-row-title { color: var(--blue); }

  .proj-row-num {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--red);
    padding-top: 0.25rem;
  }

  .proj-row-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 0.6rem;
    transition: color 0.2s;
  }

  .proj-row-desc {
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.75;
    margin-bottom: 1rem;
  }

  .proj-row-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .proj-row-tag {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--light);
    padding: 0.2rem 0.6rem;
  }

  .proj-arrow {
    font-size: 1.25rem;
    color: var(--light);
    padding-top: 0.25rem;
    transition: color 0.2s, transform 0.2s;
  }

  .proj-row:hover .proj-arrow {
    color: var(--blue);
    transform: translate(3px, -3px);
  }

  /* EXPERIENCE */
  .exp-blocks {
    padding: 3rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .exp-row {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 2.5rem;
    padding: 2.5rem 0;
    border-bottom: 1px solid var(--light);
  }

  .exp-row:last-child { border-bottom: none; }

  .exp-left {}

  .exp-years {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    color: var(--muted);
    letter-spacing: 0.08em;
    margin-bottom: 0.3rem;
  }

  .exp-company {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .exp-right-role {
    font-family: 'Unbounded', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 0.75rem;
  }

  .exp-right-desc {
    font-size: 0.875rem;
    color: var(--muted);
    line-height: 1.8;
  }

  /* FOOTER */
  .footer-block {
    background: var(--ink);
    color: var(--paper);
    padding: 4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .footer-left .footer-heading {
    font-family: 'Unbounded', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  .footer-email {
    font-family: 'Unbounded', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--paper);
    text-decoration: none;
    border-bottom: 2px solid var(--red);
    padding-bottom: 0.2rem;
  }

  .footer-right {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .footer-link {
    font-size: 0.82rem;
    color: rgba(247,244,239,0.4);
    text-decoration: none;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .footer-link::before {
    content: '';
    width: 20px;
    height: 1px;
    background: currentColor;
    flex-shrink: 0;
  }

  .footer-link:hover { color: var(--paper); }

  @media (max-width: 800px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { position: relative; height: auto; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .skills-columns { grid-template-columns: 1fr; }
    .footer-block { grid-template-columns: 1fr; }
    .hero-block, .projects-list, .skills-columns, .exp-blocks { padding-left: 2rem; padding-right: 2rem; }
  }
</style>
</head>
<body>

<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-mark"></div>
      <div class="sidebar-name">Marcus<br>Okafor</div>
      <div class="sidebar-title">Software Engineer</div>
      <ul class="sidebar-nav">
        <li><a href="#skills"><span class="nav-line"></span>Skills</a></li>
        <li><a href="#projects"><span class="nav-line"></span>Projects</a></li>
        <li><a href="#experience"><span class="nav-line"></span>Experience</a></li>
        <li><a href="#contact"><span class="nav-line"></span>Contact</a></li>
      </ul>
    </div>
    <div>
      <div class="sidebar-status">
        <div class="status-dot"></div>
        Available now
      </div>
      <div class="sidebar-info">
        Lagos · London<br>
        6 years · Backend<br>
        marcus@okafor.io
      </div>
    </div>
  </aside>

  <main>
    <div class="hero-block" data-bg-text="SWE">
      <div class="hero-eyebrow">
        <div class="eyebrow-mark"></div>
        Software Engineer Portfolio 2025
      </div>
      <h1 class="hero-h1">
        Systems<br>
        <span class="line-blue">Thinker.</span><br>
        Code<br>Craftsman.
      </h1>
      <p class="hero-summary">
        I design and build the invisible layer that makes products work — APIs, pipelines, infrastructure, and everything in between.
      </p>
      <div class="hero-cta-row">
        <a href="#projects" class="btn-ink">View Projects</a>
        <a href="#" class="btn-border">Download CV ↗</a>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-cell">
        <div class="stat-num red">6+</div>
        <div class="stat-desc">Years in industry</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num">40+</div>
        <div class="stat-desc">Projects delivered</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num blue">3</div>
        <div class="stat-desc">OSS libraries</div>
      </div>
      <div class="stat-cell">
        <div class="stat-num">99.9%</div>
        <div class="stat-desc">Avg uptime target</div>
      </div>
    </div>

    <div class="section-block" id="skills">
      <div class="section-header-row">
        <div class="section-index">01</div>
        <div class="section-title-wrap">
          <span class="section-title">Skills</span>
          <span class="section-count">12 technologies</span>
        </div>
      </div>
      <div class="skills-columns">
        <div>
          <div class="skill-group-label">Languages</div>
          <ul class="skill-list">
            <li>Python</li>
            <li>Go</li>
            <li>TypeScript</li>
            <li>Rust</li>
          </ul>
        </div>
        <div>
          <div class="skill-group-label">Infrastructure</div>
          <ul class="skill-list">
            <li>Kubernetes</li>
            <li>Docker</li>
            <li>Terraform</li>
            <li>AWS / GCP</li>
          </ul>
        </div>
        <div>
          <div class="skill-group-label">Data & APIs</div>
          <ul class="skill-list">
            <li>PostgreSQL</li>
            <li>Kafka</li>
            <li>GraphQL</li>
            <li>Redis</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="section-block" id="projects">
      <div class="section-header-row">
        <div class="section-index">02</div>
        <div class="section-title-wrap">
          <span class="section-title">Projects</span>
          <span class="section-count">4 selected</span>
        </div>
      </div>
      <div class="projects-list">
        <a href="#" class="proj-row">
          <div class="proj-row-num">001</div>
          <div>
            <div class="proj-row-title">Helios Scheduler</div>
            <p class="proj-row-desc">Distributed job scheduler with priority queues and dead-letter handling. Replaces cron for microservices environments. Processes 2M jobs/day reliably.</p>
            <div class="proj-row-tags">
              <span class="proj-row-tag">Go</span>
              <span class="proj-row-tag">Redis</span>
              <span class="proj-row-tag">PostgreSQL</span>
            </div>
          </div>
          <div class="proj-arrow">↗</div>
        </a>
        <a href="#" class="proj-row">
          <div class="proj-row-num">002</div>
          <div>
            <div class="proj-row-title">Prism Observability</div>
            <p class="proj-row-desc">OpenTelemetry-based observability SDK with automatic instrumentation for Python microservices. Plug-in sampling strategies. Used by 30 internal services.</p>
            <div class="proj-row-tags">
              <span class="proj-row-tag">Python</span>
              <span class="proj-row-tag">OTEL</span>
              <span class="proj-row-tag">Jaeger</span>
            </div>
          </div>
          <div class="proj-arrow">↗</div>
        </a>
        <a href="#" class="proj-row">
          <div class="proj-row-num">003</div>
          <div>
            <div class="proj-row-title">DataPipe CLI</div>
            <p class="proj-row-desc">Command-line ETL tool for moving data between databases, S3, and message queues. Declarative YAML config. 3.1k GitHub stars.</p>
            <div class="proj-row-tags">
              <span class="proj-row-tag">Rust</span>
              <span class="proj-row-tag">CLI</span>
              <span class="proj-row-tag">Open Source</span>
            </div>
          </div>
          <div class="proj-arrow">↗</div>
        </a>
        <a href="#" class="proj-row">
          <div class="proj-row-num">004</div>
          <div>
            <div class="proj-row-title">Auth Mesh</div>
            <p class="proj-row-desc">Service mesh plugin for mutual TLS authentication between microservices. Zero config via Kubernetes admission webhooks. Production-tested at 5k RPS.</p>
            <div class="proj-row-tags">
              <span class="proj-row-tag">Go</span>
              <span class="proj-row-tag">Kubernetes</span>
              <span class="proj-row-tag">mTLS</span>
            </div>
          </div>
          <div class="proj-arrow">↗</div>
        </a>
      </div>
    </div>

    <div class="section-block" id="experience">
      <div class="section-header-row">
        <div class="section-index">03</div>
        <div class="section-title-wrap">
          <span class="section-title">Experience</span>
          <span class="section-count">3 companies</span>
        </div>
      </div>
      <div class="exp-blocks">
        <div class="exp-row">
          <div class="exp-left">
            <div class="exp-years">2022 – Present</div>
            <div class="exp-company">Monzo</div>
          </div>
          <div>
            <div class="exp-right-role">Staff Engineer, Platform</div>
            <p class="exp-right-desc">Led core platform team of 8 engineers. Designed internal developer platform (IDP) cutting service deployment time from 40 min to 4 min. Responsible for 99.99% SLA on core banking APIs.</p>
          </div>
        </div>
        <div class="exp-row">
          <div class="exp-left">
            <div class="exp-years">2020 – 2022</div>
            <div class="exp-company">Flutterwave</div>
          </div>
          <div>
            <div class="exp-right-role">Senior Engineer</div>
            <p class="exp-right-desc">Built payment processing microservices handling $1B in annual transaction volume. Designed retry and idempotency framework adopted across 6 product teams.</p>
          </div>
        </div>
        <div class="exp-row">
          <div class="exp-left">
            <div class="exp-years">2018 – 2020</div>
            <div class="exp-company">Andela</div>
          </div>
          <div>
            <div class="exp-right-role">Software Engineer</div>
            <p class="exp-right-desc">Fullstack development for client projects. Led migration of legacy PHP systems to modern Node.js/React stacks. Mentored 6 junior developers in the fellowship program.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-block" id="contact">
      <div class="footer-left">
        <div class="footer-heading">Let's<br>talk.</div>
        <a href="mailto:marcus@okafor.io" class="footer-email">marcus@okafor.io</a>
      </div>
      <div class="footer-right">
        <a href="#" class="footer-link">GitHub — github.com/marcokafor</a>
        <a href="#" class="footer-link">LinkedIn — linkedin.com/in/marcokafor</a>
        <a href="#" class="footer-link">Twitter — @marcokafor</a>
        <a href="#" class="footer-link">Resume — Download PDF</a>
      </div>
    </div>
  </main>
</div>

</body>
</html>
`,
  },
  {
    id: "obsidian-code",
    name: "Obsidian Code",
    style: "IDE Theme",
    premium: false,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Obsidian Code — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&family=Manrope:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #1e1e2e;
    --surface: #252535;
    --surface2: #2a2a3d;
    --panel: #181825;
    --border: rgba(100,90,140,0.25);
    --text: #cdd6f4;
    --muted: #585b70;
    --subtle: #45475a;
    --kw: #cba6f7;     /* keyword purple */
    --fn: #89b4fa;     /* function blue */
    --str: #a6e3a1;    /* string green */
    --num: #fab387;    /* number orange */
    --cmt: #6c7086;    /* comment gray */
    --type: #f38ba8;   /* type red */
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* EDITOR CHROME */
  .editor-frame {
    min-height: 100vh;
  }

  /* TITLE BAR */
  .title-bar {
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0;
    height: 38px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .title-dots {
    display: flex;
    gap: 6px;
    padding: 0 16px;
    border-right: 1px solid var(--border);
    align-items: center;
    height: 100%;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.red { background: #f38ba8; }
  .dot.yellow { background: #f9e2af; }
  .dot.green { background: #a6e3a1; }

  .tabs {
    display: flex;
    height: 100%;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1.25rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.72rem;
    color: var(--muted);
    border-right: 1px solid var(--border);
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .tab.active {
    background: var(--bg);
    color: var(--text);
  }

  .tab-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--fn);
  }

  /* MAIN LAYOUT */
  .editor-body {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: calc(100vh - 38px);
  }

  /* FILE TREE */
  .file-tree {
    background: var(--panel);
    border-right: 1px solid var(--border);
    padding: 1.5rem 0;
    overflow-y: auto;
  }

  .tree-section {
    margin-bottom: 1.5rem;
  }

  .tree-section-label {
    font-family: 'Fira Code', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0.3rem 1.25rem;
    margin-bottom: 0.25rem;
  }

  .tree-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 1.25rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.78rem;
    color: var(--muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
  }

  .tree-item:hover, .tree-item.active {
    background: var(--surface);
    color: var(--text);
  }

  .tree-icon {
    font-size: 0.8rem;
    flex-shrink: 0;
    width: 14px;
    text-align: center;
  }

  .tree-item .ext-ts { color: var(--fn); }
  .tree-item .ext-py { color: var(--str); }
  .tree-item .ext-go { color: var(--num); }
  .tree-item .ext-md { color: var(--kw); }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 1rem 0;
  }

  /* CODE PANEL */
  .code-panel {
    overflow: auto;
  }

  /* HERO - looks like a code file */
  .code-hero {
    padding: 3rem 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.92rem;
    line-height: 2;
    position: relative;
  }

  .code-lines {
    padding: 0 3rem;
  }

  .line {
    display: flex;
    gap: 2.5rem;
    align-items: baseline;
  }

  .ln {
    color: var(--subtle);
    font-size: 0.72rem;
    user-select: none;
    min-width: 2rem;
    text-align: right;
    flex-shrink: 0;
    line-height: 2;
  }

  .code { flex: 1; }

  .kw { color: var(--kw); }
  .fn { color: var(--fn); }
  .str { color: var(--str); }
  .num { color: var(--num); }
  .cmt { color: var(--cmt); font-style: italic; }
  .type { color: var(--type); }
  .punc { color: var(--muted); }
  .var { color: var(--text); }
  .op { color: var(--kw); }

  /* NAME highlight */
  .hero-name {
    font-family: 'Manrope', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1;
    padding: 1rem 3rem 0.5rem 7.5rem;
  }

  .hero-name .accent { color: var(--kw); }

  .hero-subtitle {
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
    color: var(--cmt);
    padding: 0 3rem 2rem 7.5rem;
  }

  /* SECTION */
  .section {
    padding: 3rem;
    border-top: 1px solid var(--border);
  }

  .section-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.72rem;
    color: var(--fn);
    background: rgba(137,180,250,0.1);
    border: 1px solid rgba(137,180,250,0.2);
    padding: 0.35rem 0.85rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }

  .section-h {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 2rem;
    color: var(--text);
  }

  /* SKILLS GRID */
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .skill-box {
    background: var(--surface);
    padding: 1.5rem;
    transition: background 0.2s;
  }

  .skill-box:hover { background: var(--surface2); }

  .skill-tag {
    font-family: 'Fira Code', monospace;
    font-size: 0.68rem;
    color: var(--num);
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
  }

  .skill-box-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.75rem;
  }

  .skill-pips {
    display: flex;
    gap: 4px;
  }

  .pip {
    height: 3px;
    flex: 1;
    background: var(--subtle);
    border-radius: 2px;
  }

  .pip.on { background: var(--fn); }

  /* PROJECTS */
  .projects-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .proj-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.75rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, transform 0.2s;
    display: block;
  }

  .proj-box:hover {
    border-color: rgba(137,180,250,0.4);
    transform: translateY(-2px);
  }

  .proj-box-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .proj-box-type {
    font-family: 'Fira Code', monospace;
    font-size: 0.65rem;
    color: var(--str);
    letter-spacing: 0.08em;
    background: rgba(166,227,161,0.08);
    border: 1px solid rgba(166,227,161,0.2);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
  }

  .proj-box-icon {
    color: var(--muted);
    font-family: 'Fira Code', monospace;
    font-size: 0.85rem;
    transition: color 0.2s;
  }

  .proj-box:hover .proj-box-icon { color: var(--fn); }

  .proj-box-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .proj-box-desc {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 1.25rem;
  }

  .proj-box-langs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .lang-badge {
    font-family: 'Fira Code', monospace;
    font-size: 0.68rem;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    background: rgba(203,166,247,0.1);
    color: var(--kw);
    border: 1px solid rgba(203,166,247,0.2);
  }

  /* EXPERIENCE */
  .exp-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .exp-item {
    background: var(--surface);
    padding: 1.75rem;
    transition: background 0.15s;
  }

  .exp-item:hover { background: var(--surface2); }

  .exp-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }

  .exp-item-role {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
  }

  .exp-item-period {
    font-family: 'Fira Code', monospace;
    font-size: 0.72rem;
    color: var(--muted);
    white-space: nowrap;
  }

  .exp-item-co {
    font-family: 'Fira Code', monospace;
    font-size: 0.78rem;
    color: var(--num);
    margin-bottom: 0.75rem;
  }

  .exp-item-desc {
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.75;
  }

  /* CONTACT */
  .contact-section {
    background: var(--panel);
    border-top: 1px solid var(--border);
    padding: 3rem;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    max-width: 600px;
  }

  .contact-link {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    transition: border-color 0.2s;
  }

  .contact-link:hover { border-color: rgba(137,180,250,0.4); }

  .contact-link-type {
    font-family: 'Fira Code', monospace;
    font-size: 0.65rem;
    color: var(--cmt);
    letter-spacing: 0.1em;
  }

  .contact-link-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--fn);
  }

  /* STATUS BAR */
  .status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--fn);
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 0.35rem 1.5rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.7rem;
    color: var(--bg);
    z-index: 100;
    font-weight: 600;
  }

  .status-sep { opacity: 0.4; }

  @media (max-width: 780px) {
    .editor-body { grid-template-columns: 1fr; }
    .file-tree { display: none; }
    .projects-grid { grid-template-columns: 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<div class="editor-frame">

  <!-- TITLE BAR -->
  <div class="title-bar">
    <div class="title-dots">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
    </div>
    <div class="tabs">
      <div class="tab active"><div class="tab-dot"></div>portfolio.ts</div>
      <div class="tab">experience.json</div>
      <div class="tab">README.md</div>
    </div>
  </div>

  <div class="editor-body">

    <!-- FILE TREE -->
    <nav class="file-tree">
      <div class="tree-section">
        <div class="tree-section-label">Explorer</div>
        <a href="#" class="tree-item active">
          <span class="tree-icon">📄</span>
          <span class="ext-ts">portfolio.ts</span>
        </a>
        <a href="#experience" class="tree-item">
          <span class="tree-icon">📄</span>
          <span class="ext-ts">experience.json</span>
        </a>
        <a href="#projects" class="tree-item">
          <span class="tree-icon">📁</span>
          projects/
        </a>
        <a href="#projects" class="tree-item" style="padding-left:2rem">
          <span class="tree-icon">📄</span>
          <span class="ext-go">nexus.go</span>
        </a>
        <a href="#projects" class="tree-item" style="padding-left:2rem">
          <span class="tree-icon">📄</span>
          <span class="ext-py">schema.py</span>
        </a>
        <a href="#contact" class="tree-item">
          <span class="tree-icon">📄</span>
          <span class="ext-md">README.md</span>
        </a>
      </div>
      <div class="divider"></div>
      <div class="tree-section">
        <div class="tree-section-label">Skills</div>
        <div class="tree-item"><span class="tree-icon">🔵</span>Go · Rust</div>
        <div class="tree-item"><span class="tree-icon">🟡</span>Python · TS</div>
        <div class="tree-item"><span class="tree-icon">🟢</span>PostgreSQL</div>
        <div class="tree-item"><span class="tree-icon">🔵</span>Kubernetes</div>
        <div class="tree-item"><span class="tree-icon">🔴</span>AWS / GCP</div>
      </div>
    </nav>

    <!-- CODE PANEL -->
    <div class="code-panel">

      <!-- HERO AS CODE -->
      <div class="code-hero">
        <div class="code-lines">
          <div class="line"><span class="ln">1</span><span class="code"><span class="cmt">// portfolio.ts — Kai Nakamura</span></span></div>
          <div class="line"><span class="ln">2</span><span class="code"></span></div>
          <div class="line"><span class="ln">3</span><span class="code"><span class="kw">interface</span> <span class="type">Engineer</span> <span class="punc">{</span></span></div>
          <div class="line"><span class="ln">4</span><span class="code">&nbsp;&nbsp;<span class="var">name</span><span class="punc">:</span> <span class="type">string</span><span class="punc">;</span></span></div>
          <div class="line"><span class="ln">5</span><span class="code">&nbsp;&nbsp;<span class="var">role</span><span class="punc">:</span> <span class="type">string</span><span class="punc">;</span></span></div>
          <div class="line"><span class="ln">6</span><span class="code">&nbsp;&nbsp;<span class="var">yearsExp</span><span class="punc">:</span> <span class="type">number</span><span class="punc">;</span></span></div>
          <div class="line"><span class="ln">7</span><span class="code"><span class="punc">}</span></span></div>
          <div class="line"><span class="ln">8</span><span class="code"></span></div>
          <div class="line"><span class="ln">9</span><span class="code"><span class="kw">const</span> <span class="fn">me</span><span class="punc">:</span> <span class="type">Engineer</span> <span class="op">=</span> <span class="punc">{</span></span></div>
          <div class="line"><span class="ln">10</span><span class="code">&nbsp;&nbsp;<span class="var">name</span><span class="punc">:</span> <span class="str">"Kai Nakamura"</span><span class="punc">,</span></span></div>
          <div class="line"><span class="ln">11</span><span class="code">&nbsp;&nbsp;<span class="var">role</span><span class="punc">:</span> <span class="str">"Software Engineer"</span><span class="punc">,</span></span></div>
          <div class="line"><span class="ln">12</span><span class="code">&nbsp;&nbsp;<span class="var">yearsExp</span><span class="punc">:</span> <span class="num">5</span><span class="punc">,</span></span></div>
          <div class="line"><span class="ln">13</span><span class="code"><span class="punc">};</span></span></div>
        </div>

        <div class="hero-name">Kai <span class="accent">Nakamura</span></div>
        <div class="hero-subtitle">// Senior Software Engineer · Tokyo → San Francisco</div>

        <div class="code-lines" style="margin-top:1rem">
          <div class="line"><span class="ln">14</span><span class="code"></span></div>
          <div class="line"><span class="ln">15</span><span class="code"><span class="cmt">/**</span></span></div>
          <div class="line"><span class="ln">16</span><span class="code"><span class="cmt"> * I build high-performance backend systems and</span></span></div>
          <div class="line"><span class="ln">17</span><span class="code"><span class="cmt"> * developer tools. Currently open to new roles.</span></span></div>
          <div class="line"><span class="ln">18</span><span class="code"><span class="cmt"> */</span></span></div>
          <div class="line"><span class="ln">19</span><span class="code"></span></div>
          <div class="line"><span class="ln">20</span><span class="code"><span class="kw">export</span> <span class="kw">default</span> <span class="fn">me</span><span class="punc">;</span></span></div>
        </div>
      </div>

      <!-- SKILLS -->
      <section class="section" id="skills">
        <div class="section-badge">fn skills()</div>
        <h2 class="section-h">Technical Skills</h2>
        <div class="skills-grid">
          <div class="skill-box">
            <div class="skill-tag">lang</div>
            <div class="skill-box-name">Go</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div>
            </div>
          </div>
          <div class="skill-box">
            <div class="skill-tag">lang</div>
            <div class="skill-box-name">Rust</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip"></div>
            </div>
          </div>
          <div class="skill-box">
            <div class="skill-tag">lang</div>
            <div class="skill-box-name">Python</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div>
            </div>
          </div>
          <div class="skill-box">
            <div class="skill-tag">infra</div>
            <div class="skill-box-name">Kubernetes</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip"></div>
            </div>
          </div>
          <div class="skill-box">
            <div class="skill-tag">cloud</div>
            <div class="skill-box-name">AWS</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div>
            </div>
          </div>
          <div class="skill-box">
            <div class="skill-tag">db</div>
            <div class="skill-box-name">PostgreSQL</div>
            <div class="skill-pips">
              <div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip on"></div><div class="pip"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- PROJECTS -->
      <section class="section" id="projects">
        <div class="section-badge">fn projects()</div>
        <h2 class="section-h">Projects</h2>
        <div class="projects-grid">
          <a href="#" class="proj-box">
            <div class="proj-box-header">
              <span class="proj-box-type">api · open source</span>
              <span class="proj-box-icon">↗</span>
            </div>
            <div class="proj-box-name">Fenix Router</div>
            <p class="proj-box-desc">Blazing-fast HTTP router in Go with automatic service discovery and load balancing. 200k req/s on a single core.</p>
            <div class="proj-box-langs">
              <span class="lang-badge">Go</span>
              <span class="lang-badge">gRPC</span>
              <span class="lang-badge">etcd</span>
            </div>
          </a>
          <a href="#" class="proj-box">
            <div class="proj-box-header">
              <span class="proj-box-type">cli · tooling</span>
              <span class="proj-box-icon">↗</span>
            </div>
            <div class="proj-box-name">Drift</div>
            <p class="proj-box-desc">Database migration tool with rollback safety, dry-run mode, and team locking. Zero downtime migrations for Postgres.</p>
            <div class="proj-box-langs">
              <span class="lang-badge">Rust</span>
              <span class="lang-badge">SQL</span>
              <span class="lang-badge">CLI</span>
            </div>
          </a>
          <a href="#" class="proj-box">
            <div class="proj-box-header">
              <span class="proj-box-type">platform</span>
              <span class="proj-box-icon">↗</span>
            </div>
            <div class="proj-box-name">Beacon Monitor</div>
            <p class="proj-box-desc">Synthetic monitoring platform running checks from 30 global locations. Sub-minute alerting via PagerDuty, Slack, and webhooks.</p>
            <div class="proj-box-langs">
              <span class="lang-badge">Python</span>
              <span class="lang-badge">Celery</span>
              <span class="lang-badge">Redis</span>
            </div>
          </a>
          <a href="#" class="proj-box">
            <div class="proj-box-header">
              <span class="proj-box-type">ml · backend</span>
              <span class="proj-box-icon">↗</span>
            </div>
            <div class="proj-box-name">Vector Store</div>
            <p class="proj-box-desc">High-performance vector similarity search engine built on HNSW algorithm. Supports billion-scale indexes with sub-10ms queries.</p>
            <div class="proj-box-langs">
              <span class="lang-badge">Rust</span>
              <span class="lang-badge">HNSW</span>
              <span class="lang-badge">SIMD</span>
            </div>
          </a>
        </div>
      </section>

      <!-- EXPERIENCE -->
      <section class="section" id="experience">
        <div class="section-badge">fn experience()</div>
        <h2 class="section-h">Experience</h2>
        <div class="exp-list">
          <div class="exp-item">
            <div class="exp-item-header">
              <div class="exp-item-role">Senior Software Engineer</div>
              <div class="exp-item-period">2022 – Present</div>
            </div>
            <div class="exp-item-co">// Cloudflare · San Francisco</div>
            <p class="exp-item-desc">Building Cloudflare Workers runtime — the V8-based edge computing platform serving 50M+ requests/sec. Led WebAssembly integration for multi-language support.</p>
          </div>
          <div class="exp-item">
            <div class="exp-item-header">
              <div class="exp-item-role">Software Engineer</div>
              <div class="exp-item-period">2020 – 2022</div>
            </div>
            <div class="exp-item-co">// Fastly · Tokyo</div>
            <p class="exp-item-desc">Worked on edge CDN routing logic and VCL compiler improvements. Reduced cache miss rate by 18% through smarter cache invalidation algorithms.</p>
          </div>
          <div class="exp-item">
            <div class="exp-item-header">
              <div class="exp-item-role">Junior Engineer</div>
              <div class="exp-item-period">2019 – 2020</div>
            </div>
            <div class="exp-item-co">// Line Corp · Tokyo</div>
            <p class="exp-item-desc">Maintained real-time messaging infrastructure for 90M DAU. Implemented server-side message batching reducing websocket CPU load by 30%.</p>
          </div>
        </div>
      </section>

      <!-- CONTACT -->
      <section class="contact-section" id="contact">
        <div class="section-badge">fn contact()</div>
        <h2 class="section-h" style="margin-bottom:1.5rem">Get in Touch</h2>
        <div class="contact-grid">
          <a href="mailto:kai@nakamura.io" class="contact-link">
            <span class="contact-link-type">// email</span>
            <span class="contact-link-val">kai@nakamura.io</span>
          </a>
          <a href="#" class="contact-link">
            <span class="contact-link-type">// github</span>
            <span class="contact-link-val">github.com/kainakamura</span>
          </a>
          <a href="#" class="contact-link">
            <span class="contact-link-type">// linkedin</span>
            <span class="contact-link-val">in/kainakamura</span>
          </a>
          <a href="#" class="contact-link">
            <span class="contact-link-type">// resume</span>
            <span class="contact-link-val">kai_nakamura_cv.pdf</span>
          </a>
        </div>
      </section>

    </div>
  </div>
</div>

<!-- STATUS BAR -->
<div class="status-bar">
  <span>TypeScript</span>
  <span class="status-sep">·</span>
  <span>UTF-8</span>
  <span class="status-sep">·</span>
  <span>Ln 20, Col 1</span>
  <span class="status-sep">·</span>
  <span>⚡ Available for hire</span>
</div>

</body>
</html>
`,
  },
  {
    id: "kinetic-magazine",
    name: "Kinetic Magazine",
    style: "Editorial Style",
    premium: true,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kinetic — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --cream: #faf8f3;
    --dark: #111010;
    --mid: #444;
    --light: #bbb;
    --rule: rgba(0,0,0,0.12);
    --hot: #c84b11;
    --cool: #1a4faa;
    --col: 6;
  }

  body {
    background: var(--cream);
    color: var(--dark);
    font-family: 'IBM Plex Sans', sans-serif;
    overflow-x: hidden;
  }

  /* ——— MASTHEAD ——— */
  .masthead {
    border-bottom: 3px solid var(--dark);
    padding: 0;
  }

  .masthead-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 3rem;
    border-bottom: 1px solid var(--rule);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mid);
  }

  .issue-num { color: var(--hot); }

  .masthead-main {
    display: flex;
    align-items: center;
    padding: 2rem 3rem;
    gap: 2rem;
  }

  .masthead-rule {
    width: 4px;
    height: 80px;
    background: var(--hot);
    flex-shrink: 0;
  }

  .masthead-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .masthead-tagline {
    font-size: 0.8rem;
    color: var(--mid);
    font-style: italic;
    font-family: 'Playfair Display', serif;
    letter-spacing: 0.02em;
  }

  .masthead-nav {
    display: flex;
    gap: 0;
    border-top: 1px solid var(--rule);
    background: var(--dark);
  }

  .masthead-nav a {
    padding: 0.85rem 2rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    color: rgba(255,255,255,0.5);
    border-right: 1px solid rgba(255,255,255,0.08);
    transition: color 0.15s, background 0.15s;
  }

  .masthead-nav a:hover { color: #fff; background: rgba(255,255,255,0.05); }

  /* ——— FRONT PAGE LAYOUT ——— */
  .front-page {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
    border-bottom: 2px solid var(--dark);
  }

  /* LEAD STORY */
  .lead-story {
    border-right: 1px solid var(--rule);
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 500px;
    position: relative;
    overflow: hidden;
    background: var(--dark);
    color: #fff;
  }

  .lead-kicker {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--hot);
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .lead-kicker::before {
    content: '';
    width: 20px;
    height: 2px;
    background: var(--hot);
    flex-shrink: 0;
  }

  .lead-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }

  .lead-deck {
    font-size: 1rem;
    line-height: 1.75;
    color: rgba(255,255,255,0.65);
    max-width: 480px;
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  .lead-byline {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .byline-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--hot);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .byline-text {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.5);
  }

  .byline-name {
    color: #fff;
    font-weight: 600;
    display: block;
    margin-bottom: 0.15rem;
  }

  /* SIDEBAR STORIES */
  .sidebar-stories {
    display: flex;
    flex-direction: column;
  }

  .sidebar-story {
    border-bottom: 1px solid var(--rule);
    padding: 2rem;
    flex: 1;
    transition: background 0.15s;
  }

  .sidebar-story:last-child { border-bottom: none; }
  .sidebar-story:hover { background: rgba(0,0,0,0.02); }

  .story-kicker {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--cool);
    margin-bottom: 0.6rem;
  }

  .story-head {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.25;
    margin-bottom: 0.5rem;
  }

  .story-deck {
    font-size: 0.82rem;
    color: var(--mid);
    line-height: 1.65;
  }

  /* ——— CONTENT AREA ——— */
  .content-area {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 3rem;
  }

  /* COLUMN RULE SECTION */
  .ruled-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border-bottom: 2px solid var(--dark);
    padding: 3rem 0;
  }

  .col-entry {
    padding: 0 2.5rem;
    border-right: 1px solid var(--rule);
  }

  .col-entry:first-child { padding-left: 0; }
  .col-entry:last-child { border-right: none; padding-right: 0; }

  .col-kicker {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--hot);
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--hot);
  }

  .col-head {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }

  .col-body {
    font-size: 0.85rem;
    color: var(--mid);
    line-height: 1.8;
  }

  /* SKILLS FEATURE */
  .skills-feature {
    padding: 3rem 0;
    border-bottom: 2px solid var(--dark);
  }

  .feature-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mid);
    margin-bottom: 2rem;
  }

  .feature-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--rule);
  }

  .skills-columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0;
    border: 1px solid var(--rule);
  }

  .skill-col {
    border-right: 1px solid var(--rule);
    padding: 2rem;
    transition: background 0.15s;
  }

  .skill-col:last-child { border-right: none; }
  .skill-col:hover { background: rgba(0,0,0,0.02); }

  .skill-col-head {
    font-family: 'Playfair Display', serif;
    font-size: 0.9rem;
    font-weight: 700;
    font-style: italic;
    color: var(--hot);
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--rule);
  }

  .skill-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .skill-list li {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--dark);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .skill-yr {
    font-size: 0.7rem;
    color: var(--light);
    font-style: italic;
  }

  /* PROJECTS FEATURE */
  .projects-feature {
    padding: 3rem 0;
    border-bottom: 2px solid var(--dark);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-top: 2rem;
  }

  .proj-entry {
    border-top: 3px solid var(--dark);
    padding-top: 1.5rem;
    transition: border-color 0.2s;
    cursor: default;
  }

  .proj-entry:hover { border-top-color: var(--hot); }

  .proj-num {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--light);
    margin-bottom: 0.6rem;
  }

  .proj-head {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  .proj-body-text {
    font-size: 0.85rem;
    color: var(--mid);
    line-height: 1.8;
    margin-bottom: 1.25rem;
  }

  .proj-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .stack-tag {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cool);
    border: 1px solid rgba(26,79,170,0.25);
    padding: 0.25rem 0.6rem;
  }

  /* EXPERIENCE FEATURE */
  .exp-feature {
    padding: 3rem 0;
    border-bottom: 2px solid var(--dark);
  }

  .exp-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
  }

  .exp-table thead tr {
    border-bottom: 2px solid var(--dark);
  }

  .exp-table th {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--mid);
    padding: 0.75rem 1.25rem;
    text-align: left;
  }

  .exp-table tbody tr {
    border-bottom: 1px solid var(--rule);
    transition: background 0.15s;
  }

  .exp-table tbody tr:hover { background: rgba(0,0,0,0.025); }

  .exp-table td {
    padding: 1.5rem 1.25rem;
    font-size: 0.9rem;
    vertical-align: top;
  }

  .exp-td-company {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 1rem;
  }

  .exp-td-role {
    font-weight: 500;
  }

  .exp-td-period {
    color: var(--mid);
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .exp-td-desc {
    color: var(--mid);
    line-height: 1.7;
    font-size: 0.83rem;
  }

  /* FOOTER */
  .footer {
    background: var(--dark);
    color: rgba(255,255,255,0.75);
    padding: 4rem 3rem;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    align-items: start;
  }

  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #fff;
    margin-bottom: 1rem;
    line-height: 1;
  }

  .footer-bio {
    font-size: 0.85rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.4);
  }

  .footer-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  .footer-col-head {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .footer-link {
    display: block;
    font-size: 0.88rem;
    color: rgba(255,255,255,0.55);
    text-decoration: none;
    margin-bottom: 0.6rem;
    transition: color 0.15s;
  }

  .footer-link:hover { color: #fff; }

  .footer-email {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    color: #fff;
    font-style: italic;
    text-decoration: none;
    border-bottom: 1px solid rgba(200,75,17,0.4);
    padding-bottom: 0.15rem;
    transition: border-color 0.2s;
  }

  .footer-email:hover { border-color: var(--hot); }

  @media (max-width: 900px) {
    .front-page { grid-template-columns: 1fr; }
    .ruled-section { grid-template-columns: 1fr; }
    .skills-columns { grid-template-columns: 1fr 1fr; }
    .projects-grid { grid-template-columns: 1fr; }
    .footer { grid-template-columns: 1fr; }
    .footer-right { grid-template-columns: 1fr; }
    .content-area { padding: 0 1.5rem; }
  }
</style>
</head>
<body>

<!-- MASTHEAD -->
<header class="masthead">
  <div class="masthead-top">
    <span>Software Engineer Portfolio</span>
    <span><span class="issue-num">Vol. 2025</span> · San Francisco</span>
    <span>Est. 2019 · Available Now</span>
  </div>
  <div class="masthead-main">
    <div class="masthead-rule"></div>
    <div>
      <div class="masthead-title">Sam Rivera</div>
      <div class="masthead-tagline">The Engineer's Chronicle — Building Systems That Matter</div>
    </div>
  </div>
  <nav class="masthead-nav">
    <a href="#skills">Skills</a>
    <a href="#projects">Projects</a>
    <a href="#experience">Experience</a>
    <a href="#contact">Contact</a>
    <a href="#">Download CV</a>
  </nav>
</header>

<!-- FRONT PAGE -->
<div class="front-page">
  <div class="lead-story">
    <div class="lead-kicker">Featured Profile</div>
    <h1 class="lead-headline">
      Five Years<br>
      Shipping Code<br>
      That Scales.
    </h1>
    <p class="lead-deck">
      Sam Rivera is a senior software engineer specialising in distributed systems and API design. From startup chaos to enterprise reliability — building for scale is the through-line.
    </p>
    <div class="lead-byline">
      <div class="byline-avatar">SR</div>
      <div class="byline-text">
        <span class="byline-name">Sam Rivera</span>
        Senior Engineer · Formerly Stripe, Uber · Open to Roles
      </div>
    </div>
  </div>

  <div class="sidebar-stories">
    <div class="sidebar-story">
      <div class="story-kicker">Location</div>
      <div class="story-head">San Francisco Bay Area</div>
      <p class="story-deck">Open to on-site, hybrid, or fully remote opportunities worldwide.</p>
    </div>
    <div class="sidebar-story">
      <div class="story-kicker">Specialisation</div>
      <div class="story-head">Distributed Systems & API Engineering</div>
      <p class="story-deck">5 years building backend infrastructure for consumer and B2B products at scale.</p>
    </div>
    <div class="sidebar-story">
      <div class="story-kicker">Education</div>
      <div class="story-head">B.S. Computer Science, Stanford</div>
      <p class="story-deck">Class of 2019. Thesis on consensus algorithms in fault-tolerant systems.</p>
    </div>
  </div>
</div>

<!-- HIGHLIGHTS ROW -->
<div class="content-area">
  <div class="ruled-section">
    <div class="col-entry">
      <div class="col-kicker">Career Highlight</div>
      <h3 class="col-head">Led team that processed $2B in payments</h3>
      <p class="col-body">At Stripe, led the payment routing team that redesigned the transaction ledger, enabling real-time settlement for enterprise clients and reducing latency by 55%.</p>
    </div>
    <div class="col-entry">
      <div class="col-kicker">Open Source</div>
      <h3 class="col-head">3 libraries with combined 12k GitHub stars</h3>
      <p class="col-body">Built and maintains open-source tooling used by engineering teams at dozens of companies, including a rate-limiter library that became an industry reference implementation.</p>
    </div>
    <div class="col-entry">
      <div class="col-kicker">Mentorship</div>
      <h3 class="col-head">Mentored 8 engineers to promotion</h3>
      <p class="col-body">Strong track record of technical mentorship. Believes in feedback-driven growth, pair programming, and building psychological safety in engineering teams.</p>
    </div>
  </div>

  <!-- SKILLS -->
  <section class="skills-feature" id="skills">
    <div class="feature-label">Technical Competencies</div>
    <div class="skills-columns">
      <div class="skill-col">
        <div class="skill-col-head">Languages</div>
        <ul class="skill-list">
          <li>Go <span class="skill-yr">5 yrs</span></li>
          <li>Python <span class="skill-yr">5 yrs</span></li>
          <li>TypeScript <span class="skill-yr">4 yrs</span></li>
          <li>Rust <span class="skill-yr">2 yrs</span></li>
        </ul>
      </div>
      <div class="skill-col">
        <div class="skill-col-head">Infrastructure</div>
        <ul class="skill-list">
          <li>Kubernetes <span class="skill-yr">4 yrs</span></li>
          <li>Terraform <span class="skill-yr">3 yrs</span></li>
          <li>Docker <span class="skill-yr">5 yrs</span></li>
          <li>AWS <span class="skill-yr">5 yrs</span></li>
        </ul>
      </div>
      <div class="skill-col">
        <div class="skill-col-head">Data</div>
        <ul class="skill-list">
          <li>PostgreSQL <span class="skill-yr">5 yrs</span></li>
          <li>Redis <span class="skill-yr">4 yrs</span></li>
          <li>Kafka <span class="skill-yr">3 yrs</span></li>
          <li>DynamoDB <span class="skill-yr">2 yrs</span></li>
        </ul>
      </div>
      <div class="skill-col">
        <div class="skill-col-head">Practices</div>
        <ul class="skill-list">
          <li>System Design</li>
          <li>TDD / BDD</li>
          <li>Observability</li>
          <li>API Design</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- PROJECTS -->
  <section class="projects-feature" id="projects">
    <div class="feature-label">Selected Projects</div>
    <div class="projects-grid">
      <div class="proj-entry">
        <div class="proj-num">Project 01 · API Infrastructure</div>
        <h3 class="proj-head">Cascade Rate Limiter</h3>
        <p class="proj-body-text">Distributed rate limiting library for Go supporting token bucket, sliding window, and fixed window algorithms. Uses Redis Lua scripts for atomicity. Powers 40k RPS at Stripe.</p>
        <div class="proj-stack">
          <span class="stack-tag">Go</span><span class="stack-tag">Redis</span><span class="stack-tag">Open Source</span>
        </div>
      </div>
      <div class="proj-entry">
        <div class="proj-num">Project 02 · Platform Engineering</div>
        <h3 class="proj-head">Relay Event Bus</h3>
        <p class="proj-body-text">Internal pub/sub messaging platform replacing point-to-point service calls. Supports at-least-once and exactly-once delivery modes. Reduced coupling across 30 microservices.</p>
        <div class="proj-stack">
          <span class="stack-tag">Go</span><span class="stack-tag">Kafka</span><span class="stack-tag">gRPC</span>
        </div>
      </div>
      <div class="proj-entry">
        <div class="proj-num">Project 03 · Developer Tools</div>
        <h3 class="proj-head">Orbit Deploy CLI</h3>
        <p class="proj-body-text">Zero-downtime deployment tool with health checks, automatic rollback, and Slack notifications. Declarative YAML config. Replaced custom bash scripts for 12 teams.</p>
        <div class="proj-stack">
          <span class="stack-tag">Python</span><span class="stack-tag">Kubernetes</span><span class="stack-tag">CLI</span>
        </div>
      </div>
      <div class="proj-entry">
        <div class="proj-num">Project 04 · Security</div>
        <h3 class="proj-head">Vault Secrets Manager</h3>
        <p class="proj-body-text">Internal secrets management service with automatic rotation, audit logging, and fine-grained RBAC. Integrated with HashiCorp Vault and AWS Secrets Manager APIs.</p>
        <div class="proj-stack">
          <span class="stack-tag">Go</span><span class="stack-tag">Vault</span><span class="stack-tag">AWS</span>
        </div>
      </div>
    </div>
  </section>

  <!-- EXPERIENCE TABLE -->
  <section class="exp-feature" id="experience">
    <div class="feature-label">Career Timeline</div>
    <table class="exp-table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Period</th>
          <th>Impact</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><div class="exp-td-company">Stripe</div></td>
          <td><div class="exp-td-role">Senior Software Engineer</div></td>
          <td class="exp-td-period">2022–Present</td>
          <td class="exp-td-desc">Led payment routing redesign; $2B+ daily throughput; P99 latency down 55%.</td>
        </tr>
        <tr>
          <td><div class="exp-td-company">Uber</div></td>
          <td><div class="exp-td-role">Software Engineer II</div></td>
          <td class="exp-td-period">2020–2022</td>
          <td class="exp-td-desc">Built real-time surge pricing calculation engine handling 1M concurrent riders.</td>
        </tr>
        <tr>
          <td><div class="exp-td-company">Dropbox</div></td>
          <td><div class="exp-td-role">Software Engineer</div></td>
          <td class="exp-td-period">2019–2020</td>
          <td class="exp-td-desc">Improved file sync reliability from 99.5% to 99.95% through retry logic overhaul.</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<!-- FOOTER / CONTACT -->
<footer class="footer" id="contact">
  <div>
    <div class="footer-brand">Sam<br>Rivera</div>
    <p class="footer-bio">Senior Software Engineer with 5+ years shipping distributed systems and developer infrastructure. Currently open to senior engineering roles at product-led companies.</p>
  </div>
  <div class="footer-right">
    <div>
      <div class="footer-col-head">Contact</div>
      <a href="mailto:sam@rivera.io" class="footer-email">sam@rivera.io</a>
    </div>
    <div>
      <div class="footer-col-head">Profiles</div>
      <a href="#" class="footer-link">GitHub</a>
      <a href="#" class="footer-link">LinkedIn</a>
      <a href="#" class="footer-link">Resume PDF</a>
    </div>
  </div>
</footer>

</body>
</html>
`,
  }
];
