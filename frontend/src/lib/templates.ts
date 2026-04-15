// src/lib/templates.ts
// Each template must contain {{placeholders}} that match the keys returned
// by Gemini's JSON extractor in geminiService.js.
//
// Supported placeholders:
//   {{name}}           full name
//   {{title}}          job title
//   {{email}}          email address
//   {{phone}}          phone number
//   {{location}}       city, country
//   {{summary}}        2-3 sentence professional summary
//   {{skills}}         comma-separated skill list
//   {{experience}}     pipe-separated experience entries
//   {{education}}      pipe-separated education entries
//   {{projects}}       pipe-separated project entries
//   {{certifications}} comma-separated certs (may be empty)
//   {{linkedin}}       full LinkedIn URL (may be empty)
//   {{github}}         full GitHub URL (may be empty)
//   {{portfolio}}      portfolio URL (may be empty)

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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #060a12; --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(255,255,255,0.08); --green: #00ff88;
    --green-dim: rgba(0,255,136,0.12); --cyan: #00d4ff;
    --text: #e0e6f0; --muted: #4a5568; --card-bg: rgba(255,255,255,0.03);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; min-height: 100vh; overflow-x: hidden; }
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image: linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none; z-index: 0;
  }
  body::after {
    content: ''; position: fixed; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
    top: -200px; right: -200px; pointer-events: none; z-index: 0;
  }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 1; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(6,10,18,0.8); backdrop-filter: blur(16px); border-bottom: 1px solid var(--glass-border); padding: 1rem 0; }
  nav .inner { max-width: 1100px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--green); letter-spacing: 0.05em; }
  .logo span { color: var(--muted); }
  nav ul { list-style: none; display: flex; gap: 2rem; }
  nav a { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--muted); text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; }
  nav a:hover { color: var(--green); }
  .hero { padding: 12rem 0 8rem; position: relative; }
  .hero-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: var(--green); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
  .hero-tag::before { content: ''; display: inline-block; width: 24px; height: 1px; background: var(--green); }
  .hero h1 { font-size: clamp(3rem, 7vw, 6rem); font-weight: 800; line-height: 1; letter-spacing: -0.03em; margin-bottom: 1.5rem; }
  .hero h1 em { font-style: normal; color: transparent; -webkit-text-stroke: 1px rgba(0,255,136,0.4); }
  .hero-desc { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: #6b7280; max-width: 560px; line-height: 1.8; margin-bottom: 3rem; }
  .hero-desc .highlight { color: var(--cyan); }
  .hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn-primary { background: var(--green); color: #000; padding: 0.85rem 2rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; transition: opacity 0.2s, transform 0.2s; display: inline-block; }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-ghost { border: 1px solid var(--glass-border); color: var(--text); padding: 0.85rem 2rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase; transition: border-color 0.2s, color 0.2s; display: inline-block; }
  .btn-ghost:hover { border-color: var(--green); color: var(--green); }
  .status-bar { display: flex; align-items: center; gap: 2rem; margin-top: 5rem; padding: 1.25rem 1.5rem; border: 1px solid var(--glass-border); background: var(--card-bg); flex-wrap: wrap; }
  .status-item { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; display: flex; align-items: center; gap: 0.5rem; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .status-label { color: var(--muted); }
  .status-value { color: var(--text); }
  section { padding: 6rem 0; }
  .section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
  .section-num { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--green); letter-spacing: 0.1em; }
  .section-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
  .section-line { flex: 1; height: 1px; background: var(--glass-border); }
  .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1px; background: var(--glass-border); border: 1px solid var(--glass-border); }
  .skill-card { background: var(--bg); padding: 1.5rem; transition: background 0.2s; }
  .skill-card:hover { background: var(--glass); }
  .skill-cat { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--green); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.75rem; }
  .skill-name { font-size: 1.1rem; font-weight: 700; }
  .info-block { border: 1px solid var(--glass-border); background: var(--card-bg); padding: 2rem; margin-bottom: 1rem; }
  .info-block p { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #6b7280; line-height: 1.8; }
  .info-block .entry { border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1rem; }
  .info-block .entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--glass-border); border: 1px solid var(--glass-border); }
  .contact-item { background: var(--bg); padding: 2rem; display: flex; flex-direction: column; gap: 0.5rem; text-decoration: none; transition: background 0.2s; }
  .contact-item:hover { background: var(--card-bg); }
  .contact-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; }
  .contact-value { font-size: 1rem; font-weight: 700; color: var(--text); word-break: break-all; }
  .contact-arrow { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--green); margin-top: 0.25rem; }
  footer { border-top: 1px solid var(--glass-border); padding: 2rem 0; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
  @media (max-width: 640px) { .contact-grid { grid-template-columns: 1fr; } nav ul { display: none; } }
</style>
</head>
<body>
<nav>
  <div class="inner">
    <div class="logo"><span>~/</span>{{name}}<span>.dev</span></div>
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
    <p class="hero-tag">{{title}}</p>
    <h1>{{name}}</h1>
    <p class="hero-desc">{{summary}}</p>
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
        <span class="status-value">{{location}}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Role:</span>
        <span class="status-value">{{title}}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Email:</span>
        <span class="status-value">{{email}}</span>
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
      <!-- Skills are rendered as individual cards by the script below -->
    </div>
    <script>
      (function() {
        var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
        var grid = document.querySelector(".skills-grid");
        skills.forEach(function(skill) {
          var card = document.createElement("div");
          card.className = "skill-card";
          card.innerHTML = '<div class="skill-name">' + skill + '</div>';
          grid.appendChild(card);
        });
      })();
    </script>
  </section>

  <section id="projects">
    <div class="section-header">
      <span class="section-num">02</span>
      <h2 class="section-title">Projects</h2>
      <div class="section-line"></div>
    </div>
    <div class="info-block" id="projects-block">
      <script>
        (function() {
          var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var block = document.getElementById("projects-block");
          entries.forEach(function(entry, i) {
            var div = document.createElement("div");
            div.className = "entry";
            div.innerHTML = '<p><span style="color:#00ff88;font-family:JetBrains Mono,monospace;font-size:0.7rem;">// project_0' + (i+1) + '</span><br>' + entry + '</p>';
            block.appendChild(div);
          });
        })();
      </script>
    </div>
  </section>

  <section id="experience">
    <div class="section-header">
      <span class="section-num">03</span>
      <h2 class="section-title">Experience</h2>
      <div class="section-line"></div>
    </div>
    <div class="info-block" id="exp-block">
      <script>
        (function() {
          var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var block = document.getElementById("exp-block");
          entries.forEach(function(entry) {
            var div = document.createElement("div");
            div.className = "entry";
            div.innerHTML = '<p>' + entry + '</p>';
            block.appendChild(div);
          });
        })();
      </script>
    </div>
  </section>

  <section id="education">
    <div class="section-header">
      <span class="section-num">04</span>
      <h2 class="section-title">Education</h2>
      <div class="section-line"></div>
    </div>
    <div class="info-block" id="edu-block">
      <script>
        (function() {
          var entries = "{{education}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var block = document.getElementById("edu-block");
          entries.forEach(function(entry) {
            var div = document.createElement("div");
            div.className = "entry";
            div.innerHTML = '<p>' + entry + '</p>';
            block.appendChild(div);
          });
        })();
      </script>
    </div>
  </section>

  <section id="contact">
    <div class="section-header">
      <span class="section-num">05</span>
      <h2 class="section-title">Contact</h2>
      <div class="section-line"></div>
    </div>
    <div class="contact-grid">
      <a href="mailto:{{email}}" class="contact-item">
        <span class="contact-label">Email</span>
        <span class="contact-value">{{email}}</span>
        <span class="contact-arrow">→ send message</span>
      </a>
      <a href="{{github}}" class="contact-item">
        <span class="contact-label">GitHub</span>
        <span class="contact-value">{{github}}</span>
        <span class="contact-arrow">→ view repos</span>
      </a>
      <a href="{{linkedin}}" class="contact-item">
        <span class="contact-label">LinkedIn</span>
        <span class="contact-value">{{linkedin}}</span>
        <span class="contact-arrow">→ connect</span>
      </a>
      <div class="contact-item">
        <span class="contact-label">Phone</span>
        <span class="contact-value">{{phone}}</span>
        <span class="contact-arrow">→ call</span>
      </div>
    </div>
  </section>

  <footer>
    <span>© 2025 {{name}}</span>
    <span>{{location}}</span>
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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --black: #0a0a0a; --white: #f5f0e8; --accent: #ff3d00; --yellow: #ffdd00; }
  body { background: var(--white); color: var(--black); font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
  header { border-bottom: 3px solid var(--black); display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0; position: sticky; top: 0; background: var(--white); z-index: 100; }
  .nav-left { border-right: 3px solid var(--black); padding: 1.25rem 2rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; }
  .nav-center { padding: 1.25rem 3rem; font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.1em; white-space: nowrap; }
  .nav-right { border-left: 3px solid var(--black); padding: 0; display: flex; }
  .nav-right a { padding: 1.25rem 1.5rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; color: var(--black); border-right: 1px solid rgba(0,0,0,0.1); transition: background 0.15s; }
  .nav-right a:last-child { border-right: none; }
  .nav-right a:hover { background: var(--yellow); }
  .hero { border-bottom: 3px solid var(--black); display: grid; grid-template-columns: 1fr 420px; min-height: 85vh; }
  .hero-left { border-right: 3px solid var(--black); padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: space-between; }
  .hero-eyebrow { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 3rem; }
  .eyebrow-dash { width: 30px; height: 2px; background: var(--accent); }
  .hero-name { font-family: 'Bebas Neue', sans-serif; font-size: clamp(5rem, 12vw, 11rem); line-height: 0.9; letter-spacing: 0.01em; margin-bottom: 3rem; }
  .hero-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 2px solid var(--black); }
  .meta-cell { padding: 1.25rem; border-right: 1px solid var(--black); border-bottom: 1px solid var(--black); }
  .meta-cell:nth-child(even) { border-right: none; }
  .meta-cell:nth-last-child(-n+2) { border-bottom: none; }
  .meta-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #888; margin-bottom: 0.35rem; }
  .meta-val { font-size: 0.95rem; font-weight: 600; }
  .hero-right { padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: center; gap: 2rem; background: var(--black); color: var(--white); }
  .hero-tagline { font-size: 1.4rem; font-weight: 300; line-height: 1.6; }
  .hero-tagline strong { font-weight: 700; }
  .available-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--yellow); color: var(--black); padding: 0.6rem 1.2rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; width: fit-content; }
  .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--black); animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .hero-cta-stack { display: flex; flex-direction: column; gap: 0; border: 2px solid rgba(255,255,255,0.2); }
  .cta-row { padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); text-decoration: none; color: var(--white); transition: background 0.15s; font-size: 0.85rem; font-weight: 500; }
  .cta-row:last-child { border-bottom: none; }
  .cta-row:hover { background: rgba(255,255,255,0.08); }
  .cta-arrow { color: var(--yellow); font-size: 1.1rem; }
  .section-masthead { border-bottom: 3px solid var(--black); padding: 1.5rem 3rem; display: flex; align-items: baseline; gap: 1.5rem; }
  .masthead-num { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--accent); letter-spacing: 0.1em; }
  .masthead-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.05em; line-height: 1; }
  .content-section { border-bottom: 3px solid var(--black); }
  .section-body { padding: 2.5rem 3rem; }
  .entry-block { border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 1.25rem; margin-bottom: 1.25rem; font-size: 0.9rem; line-height: 1.7; color: #444; }
  .entry-block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .skill-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .skill-pill { background: var(--black); color: var(--white); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.35rem 0.75rem; }
  footer { background: var(--black); color: var(--white); display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 3px solid var(--black); }
  .footer-cell { padding: 3rem; border-right: 1px solid rgba(255,255,255,0.1); }
  .footer-cell:last-child { border-right: none; }
  .footer-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #666; margin-bottom: 1rem; }
  .footer-big { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.05em; }
  .footer-link { font-size: 0.9rem; color: #aaa; text-decoration: none; display: block; margin-bottom: 0.5rem; transition: color 0.15s; word-break: break-all; }
  .footer-link:hover { color: var(--yellow); }
  @media (max-width: 900px) { .hero { grid-template-columns: 1fr; } .footer { grid-template-columns: 1fr; } header { grid-template-columns: 1fr; } .nav-right { flex-wrap: wrap; border-left: none; border-top: 1px solid rgba(0,0,0,0.1); } }
</style>
</head>
<body>
<header>
  <div class="nav-left">{{title}}</div>
  <div class="nav-center">{{name}}</div>
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
      <div class="hero-eyebrow"><div class="eyebrow-dash"></div>{{title}}</div>
      <div class="hero-name">{{name}}</div>
    </div>
    <div class="hero-meta">
      <div class="meta-cell"><div class="meta-label">Location</div><div class="meta-val">{{location}}</div></div>
      <div class="meta-cell"><div class="meta-label">Email</div><div class="meta-val">{{email}}</div></div>
      <div class="meta-cell"><div class="meta-label">Phone</div><div class="meta-val">{{phone}}</div></div>
      <div class="meta-cell"><div class="meta-label">GitHub</div><div class="meta-val">{{github}}</div></div>
    </div>
  </div>
  <div class="hero-right">
    <div class="available-badge"><div class="badge-dot"></div>Open to Opportunities</div>
    <p class="hero-tagline">{{summary}}</p>
    <div class="hero-cta-stack">
      <a href="#projects" class="cta-row">View selected work <span class="cta-arrow">↓</span></a>
      <a href="mailto:{{email}}" class="cta-row">Send an email <span class="cta-arrow">→</span></a>
      <a href="{{linkedin}}" class="cta-row">LinkedIn profile <span class="cta-arrow">↗</span></a>
    </div>
  </div>
</section>

<section class="content-section" id="skills">
  <div class="section-masthead"><span class="masthead-num">01 —</span><span class="masthead-title">Technical Skills</span></div>
  <div class="section-body">
    <div class="skill-pills" id="skills-pills"></div>
    <script>
      (function() {
        var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
        var container = document.getElementById("skills-pills");
        skills.forEach(function(skill) {
          var span = document.createElement("span");
          span.className = "skill-pill";
          span.textContent = skill;
          container.appendChild(span);
        });
      })();
    </script>
  </div>
</section>

<section class="content-section" id="projects">
  <div class="section-masthead"><span class="masthead-num">02 —</span><span class="masthead-title">Selected Work</span></div>
  <div class="section-body" id="projects-body">
    <script>
      (function() {
        var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var body = document.getElementById("projects-body");
        entries.forEach(function(entry) {
          var div = document.createElement("div");
          div.className = "entry-block";
          div.textContent = entry;
          body.appendChild(div);
        });
      })();
    </script>
  </div>
</section>

<section class="content-section" id="experience">
  <div class="section-masthead"><span class="masthead-num">03 —</span><span class="masthead-title">Experience</span></div>
  <div class="section-body" id="exp-body">
    <script>
      (function() {
        var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var body = document.getElementById("exp-body");
        entries.forEach(function(entry) {
          var div = document.createElement("div");
          div.className = "entry-block";
          div.textContent = entry;
          body.appendChild(div);
        });
      })();
    </script>
  </div>
</section>

<section class="content-section" id="education">
  <div class="section-masthead"><span class="masthead-num">04 —</span><span class="masthead-title">Education</span></div>
  <div class="section-body" id="edu-body">
    <script>
      (function() {
        var entries = "{{education}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var body = document.getElementById("edu-body");
        entries.forEach(function(entry) {
          var div = document.createElement("div");
          div.className = "entry-block";
          div.textContent = entry;
          body.appendChild(div);
        });
      })();
    </script>
  </div>
</section>

<footer id="contact">
  <div class="footer-cell"><div class="footer-label">Name</div><div class="footer-big">{{name}}</div></div>
  <div class="footer-cell">
    <div class="footer-label">Contact</div>
    <a href="mailto:{{email}}" class="footer-link">{{email}}</a>
    <a href="{{github}}" class="footer-link">{{github}}</a>
    <a href="{{linkedin}}" class="footer-link">{{linkedin}}</a>
  </div>
  <div class="footer-cell">
    <div class="footer-label">Location</div>
    <p style="font-size:0.9rem; color:#aaa; line-height:1.7">{{location}}<br>{{phone}}</p>
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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --bg: #08090d; --surface: #0f111a; --surface2: #141721; --border: rgba(255,255,255,0.07); --text: #e8eaf0; --muted: #5a6070; --a1: #a78bfa; --a2: #60a5fa; --a3: #34d399; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .aurora-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .aurora-blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; }
  .blob1 { width: 700px; height: 700px; background: var(--a1); top: -200px; left: -200px; animation: drift1 20s ease-in-out infinite alternate; }
  .blob2 { width: 500px; height: 500px; background: var(--a2); bottom: 0; right: -100px; animation: drift2 25s ease-in-out infinite alternate; }
  .blob3 { width: 400px; height: 400px; background: var(--a3); top: 50%; left: 50%; transform: translate(-50%,-50%); animation: drift3 18s ease-in-out infinite alternate; }
  @keyframes drift1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(80px,80px) scale(1.1); } }
  @keyframes drift2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-60px,-60px) scale(1.15); } }
  @keyframes drift3 { 0% { transform: translate(-50%,-50%) scale(1); } 100% { transform: translate(-40%,-60%) scale(0.9); } }
  .wrap { position: relative; z-index: 1; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.5rem 3rem; display: flex; align-items: center; justify-content: space-between; background: rgba(8,9,13,0.7); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .nav-brand { font-family: 'DM Serif Display', serif; font-size: 1.25rem; letter-spacing: 0.02em; }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links a { font-size: 0.82rem; color: var(--muted); text-decoration: none; font-weight: 400; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta { font-size: 0.82rem; font-weight: 500; color: var(--bg); background: var(--text); padding: 0.6rem 1.4rem; text-decoration: none; border-radius: 100px; transition: opacity 0.2s; }
  .nav-cta:hover { opacity: 0.85; }
  .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 10rem 3rem 6rem; max-width: 1000px; margin: 0 auto; }
  .hero-role { display: inline-flex; align-items: center; gap: 0.75rem; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 2rem; border: 1px solid var(--border); padding: 0.5rem 1.2rem; border-radius: 100px; width: fit-content; backdrop-filter: blur(8px); background: rgba(255,255,255,0.03); }
  .role-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--a3); flex-shrink: 0; box-shadow: 0 0 8px var(--a3); }
  .hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(3.5rem, 8vw, 7rem); font-weight: 400; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 2rem; }
  .hero h1 .gradient-text { background: linear-gradient(135deg, var(--a1), var(--a2), var(--a3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-sub { font-size: 1.1rem; color: var(--muted); font-weight: 300; max-width: 560px; line-height: 1.8; margin-bottom: 3.5rem; }
  .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .btn-aurora { background: linear-gradient(135deg, var(--a1), var(--a2)); color: #fff; padding: 0.9rem 2.2rem; border-radius: 100px; font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
  .btn-aurora:hover { opacity: 0.88; transform: translateY(-2px); }
  .btn-outline { border: 1px solid var(--border); color: var(--text); padding: 0.9rem 2.2rem; border-radius: 100px; font-size: 0.9rem; font-weight: 400; text-decoration: none; backdrop-filter: blur(8px); background: rgba(255,255,255,0.03); transition: border-color 0.2s; }
  .btn-outline:hover { border-color: rgba(255,255,255,0.2); }
  .hero-stats { display: flex; gap: 3rem; margin-top: 4rem; padding-top: 4rem; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .stat-num { font-family: 'DM Serif Display', serif; font-size: 2.5rem; font-weight: 400; line-height: 1; background: linear-gradient(135deg, var(--a1), var(--a2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.3rem; }
  .stat-label { font-size: 0.8rem; color: var(--muted); font-weight: 400; }
  .content-section { max-width: 1000px; margin: 0 auto; padding: 6rem 3rem; }
  .section-label { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase; color: var(--a1); margin-bottom: 1rem; }
  .section-heading { font-family: 'DM Serif Display', serif; font-size: 2.5rem; font-weight: 400; margin-bottom: 2.5rem; letter-spacing: -0.01em; }
  .skill-item { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem 1.75rem; transition: border-color 0.2s, transform 0.2s; margin-bottom: 1rem; font-size: 0.9rem; color: var(--muted); line-height: 1.7; }
  .skill-item:hover { border-color: rgba(167,139,250,0.3); transform: translateY(-2px); }
  .skill-item strong { color: var(--text); display: block; margin-bottom: 0.25rem; font-size: 1rem; }
  .proj-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem; margin-bottom: 1.5rem; transition: border-color 0.2s, transform 0.2s; }
  .proj-card:hover { border-color: rgba(167,139,250,0.3); transform: translateY(-2px); }
  .proj-meta { font-size: 0.75rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem; }
  .proj-title { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; margin-bottom: 0.75rem; }
  .proj-body { font-size: 0.9rem; color: var(--muted); line-height: 1.75; }
  .exp-timeline { position: relative; padding-left: 2rem; }
  .exp-timeline::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 0; width: 1px; background: linear-gradient(to bottom, var(--a1), transparent); }
  .exp-entry { position: relative; padding-bottom: 3rem; }
  .exp-entry::before { content: ''; position: absolute; left: -2rem; top: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--a1); transform: translateX(-3px); box-shadow: 0 0 12px var(--a1); }
  .exp-period { font-size: 0.75rem; color: var(--muted); letter-spacing: 0.08em; margin-bottom: 0.5rem; }
  .exp-role { font-family: 'DM Serif Display', serif; font-size: 1.5rem; font-weight: 400; margin-bottom: 0.25rem; }
  .exp-co { font-size: 0.85rem; color: var(--a2); font-weight: 500; margin-bottom: 1rem; }
  .exp-body { font-size: 0.88rem; color: var(--muted); line-height: 1.8; }
  .contact-wrap { text-align: center; max-width: 600px; margin: 0 auto; padding: 8rem 3rem; }
  .contact-heading { font-family: 'DM Serif Display', serif; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 400; line-height: 1.15; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
  .contact-heading .italic { font-style: italic; color: var(--a1); }
  .contact-sub { font-size: 1rem; color: var(--muted); line-height: 1.8; margin-bottom: 3rem; }
  .contact-email { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; transition: border-color 0.2s; }
  .contact-email:hover { border-color: var(--a1); }
  .contact-links { display: flex; gap: 1.5rem; justify-content: center; margin-top: 2.5rem; }
  .c-link { font-size: 0.82rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
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
    <div class="nav-brand">{{name}}</div>
    <ul class="nav-links">
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#experience">Experience</a></li>
    </ul>
    <a href="mailto:{{email}}" class="nav-cta">Hire me</a>
  </nav>

  <section class="hero">
    <div class="hero-role"><span class="role-dot"></span>{{title}} · Open to Opportunities</div>
    <h1>{{name}}<br><span class="gradient-text">{{title}}</span></h1>
    <p class="hero-sub">{{summary}}</p>
    <div class="hero-actions">
      <a href="#projects" class="btn-aurora">See my work</a>
      <a href="{{github}}" class="btn-outline">GitHub ↗</a>
    </div>
    <div class="hero-stats">
      <div class="stat-item"><div class="stat-num">{{location}}</div><div class="stat-label">Location</div></div>
    </div>
  </section>

  <section class="content-section" id="skills">
    <div class="section-label">What I work with</div>
    <h2 class="section-heading">Core Skills</h2>
    <div id="skills-list"></div>
    <script>
      (function() {
        var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
        var list = document.getElementById("skills-list");
        skills.forEach(function(skill) {
          var div = document.createElement("div");
          div.className = "skill-item";
          div.innerHTML = '<strong>' + skill + '</strong>';
          list.appendChild(div);
        });
      })();
    </script>
  </section>

  <section class="content-section" id="projects">
    <div class="section-label">Recent work</div>
    <h2 class="section-heading">Selected Projects</h2>
    <div id="projects-list"></div>
    <script>
      (function() {
        var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var list = document.getElementById("projects-list");
        entries.forEach(function(entry, i) {
          var parts = entry.split(":");
          var title = parts[0] ? parts[0].trim() : "Project " + (i+1);
          var desc = parts.slice(1).join(":").trim();
          var div = document.createElement("div");
          div.className = "proj-card";
          div.innerHTML = '<div class="proj-meta">Project 0' + (i+1) + '</div><div class="proj-title">' + title + '</div><p class="proj-body">' + (desc || entry) + '</p>';
          list.appendChild(div);
        });
      })();
    </script>
  </section>

  <section class="content-section" id="experience">
    <div class="section-label">Where I have worked</div>
    <h2 class="section-heading">Experience</h2>
    <div class="exp-timeline" id="exp-timeline"></div>
    <script>
      (function() {
        var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var timeline = document.getElementById("exp-timeline");
        entries.forEach(function(entry) {
          var div = document.createElement("div");
          div.className = "exp-entry";
          div.innerHTML = '<p class="exp-body">' + entry + '</p>';
          timeline.appendChild(div);
        });
      })();
    </script>
  </section>

  <div class="contact-wrap" id="contact">
    <div class="section-label">Get in touch</div>
    <h2 class="contact-heading">Ready to build<br>something <span class="italic">great?</span></h2>
    <p class="contact-sub">{{summary}}</p>
    <a href="mailto:{{email}}" class="contact-email">{{email}}</a>
    <div class="contact-links">
      <a href="{{github}}" class="c-link">GitHub</a>
      <a href="{{linkedin}}" class="c-link">LinkedIn</a>
      <a href="{{portfolio}}" class="c-link">Portfolio</a>
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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300;400;700;900&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --ink: #0f0f0f; --paper: #f7f4ef; --paper2: #ede9e1; --red: #e5182c; --blue: #0050ff; --muted: #8a8070; --light: #c8c0b0; }
  body { background: var(--paper); color: var(--ink); font-family: 'Instrument Sans', sans-serif; overflow-x: hidden; }
  .layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; }
  .sidebar { position: sticky; top: 0; height: 100vh; background: var(--ink); color: var(--paper); display: flex; flex-direction: column; overflow: hidden; padding: 3rem 2.5rem; gap: 3rem; }
  .sidebar-top { flex: 1; }
  .sidebar-mark { width: 36px; height: 36px; background: var(--red); margin-bottom: 3rem; }
  .sidebar-name { font-family: 'Unbounded', sans-serif; font-size: 1rem; font-weight: 700; line-height: 1.3; letter-spacing: 0.01em; margin-bottom: 0.5rem; }
  .sidebar-title { font-size: 0.78rem; color: rgba(247,244,239,0.4); font-weight: 400; letter-spacing: 0.05em; margin-bottom: 1rem; }
  .sidebar-location { font-size: 0.72rem; color: rgba(247,244,239,0.3); margin-bottom: 2rem; }
  .sidebar-nav { list-style: none; display: flex; flex-direction: column; gap: 0.15rem; }
  .sidebar-nav a { display: flex; align-items: center; gap: 1rem; padding: 0.7rem 1rem; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; color: rgba(247,244,239,0.45); border-radius: 4px; transition: color 0.2s, background 0.2s; }
  .sidebar-nav a:hover { color: var(--paper); background: rgba(255,255,255,0.06); }
  .nav-line { width: 16px; height: 1px; background: currentColor; flex-shrink: 0; }
  .sidebar-info { font-size: 0.72rem; color: rgba(247,244,239,0.25); line-height: 1.7; word-break: break-all; }
  .sidebar-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: #4ade80; margin-bottom: 1.5rem; font-weight: 500; }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: #4ade80; animation: blink 2s infinite; flex-shrink: 0; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  main { overflow: hidden; }
  .hero-block { border-bottom: 1px solid var(--light); padding: 5rem 4rem; position: relative; overflow: hidden; }
  .hero-eyebrow { font-family: 'Unbounded', sans-serif; font-size: 0.65rem; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted); margin-bottom: 2.5rem; display: flex; align-items: center; gap: 1rem; }
  .eyebrow-mark { width: 8px; height: 8px; background: var(--red); flex-shrink: 0; }
  .hero-h1 { font-family: 'Unbounded', sans-serif; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 2.5rem; max-width: 600px; }
  .hero-h1 .line-blue { color: var(--blue); }
  .hero-summary { font-size: 1.05rem; color: var(--muted); line-height: 1.85; max-width: 480px; margin-bottom: 3rem; font-weight: 400; }
  .hero-cta-row { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn-ink { background: var(--ink); color: var(--paper); padding: 0.85rem 2rem; font-family: 'Unbounded', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: background 0.2s; }
  .btn-ink:hover { background: var(--blue); }
  .btn-border { border: 1px solid var(--light); color: var(--ink); padding: 0.85rem 2rem; font-family: 'Unbounded', sans-serif; font-size: 0.7rem; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: border-color 0.2s; }
  .btn-border:hover { border-color: var(--ink); }
  .section-block { border-bottom: 1px solid var(--light); }
  .section-header-row { display: grid; grid-template-columns: 3rem 1fr; align-items: start; border-bottom: 1px solid var(--light); }
  .section-index { padding: 1.5rem 0; text-align: center; border-right: 1px solid var(--light); font-family: 'Unbounded', sans-serif; font-size: 0.65rem; font-weight: 700; color: var(--red); letter-spacing: 0.1em; writing-mode: vertical-rl; text-orientation: mixed; height: 100%; display: flex; align-items: center; justify-content: center; }
  .section-title-wrap { padding: 2rem 4rem; display: flex; align-items: baseline; gap: 1.5rem; }
  .section-title { font-family: 'Unbounded', sans-serif; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; }
  .content-body { padding: 2.5rem 4rem; }
  .entry-item { border-bottom: 1px solid var(--light); padding-bottom: 1.25rem; margin-bottom: 1.25rem; font-size: 0.875rem; color: #555; line-height: 1.8; }
  .entry-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .skill-tag { font-family: 'Unbounded', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--light); padding: 0.35rem 0.8rem; }
  .footer-block { background: var(--ink); color: var(--paper); padding: 4rem; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
  .footer-heading { font-family: 'Unbounded', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 1.5rem; }
  .footer-email { font-family: 'Unbounded', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--paper); text-decoration: none; border-bottom: 2px solid var(--red); padding-bottom: 0.2rem; }
  .footer-link { font-size: 0.82rem; color: rgba(247,244,239,0.4); text-decoration: none; transition: color 0.2s; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; word-break: break-all; }
  .footer-link::before { content: ''; width: 20px; height: 1px; background: currentColor; flex-shrink: 0; }
  .footer-link:hover { color: var(--paper); }
  @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .sidebar { position: relative; height: auto; } .footer-block { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-mark"></div>
      <div class="sidebar-name">{{name}}</div>
      <div class="sidebar-title">{{title}}</div>
      <div class="sidebar-location">{{location}}</div>
      <ul class="sidebar-nav">
        <li><a href="#skills"><span class="nav-line"></span>Skills</a></li>
        <li><a href="#projects"><span class="nav-line"></span>Projects</a></li>
        <li><a href="#experience"><span class="nav-line"></span>Experience</a></li>
        <li><a href="#contact"><span class="nav-line"></span>Contact</a></li>
      </ul>
    </div>
    <div>
      <div class="sidebar-status"><div class="status-dot"></div>Available now</div>
      <div class="sidebar-info">{{location}}<br>{{email}}<br>{{phone}}</div>
    </div>
  </aside>
  <main>
    <div class="hero-block">
      <div class="hero-eyebrow"><div class="eyebrow-mark"></div>{{title}} Portfolio</div>
      <h1 class="hero-h1">{{name}}<br><span class="line-blue">{{title}}</span></h1>
      <p class="hero-summary">{{summary}}</p>
      <div class="hero-cta-row">
        <a href="#projects" class="btn-ink">View Projects</a>
        <a href="{{github}}" class="btn-border">GitHub ↗</a>
      </div>
    </div>

    <div class="section-block" id="skills">
      <div class="section-header-row">
        <div class="section-index">01</div>
        <div class="section-title-wrap"><span class="section-title">Skills</span></div>
      </div>
      <div class="content-body">
        <div class="skill-tags" id="skills-tags"></div>
        <script>
          (function() {
            var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
            var container = document.getElementById("skills-tags");
            skills.forEach(function(skill) {
              var span = document.createElement("span");
              span.className = "skill-tag";
              span.textContent = skill;
              container.appendChild(span);
            });
          })();
        </script>
      </div>
    </div>

    <div class="section-block" id="projects">
      <div class="section-header-row">
        <div class="section-index">02</div>
        <div class="section-title-wrap"><span class="section-title">Projects</span></div>
      </div>
      <div class="content-body" id="projects-content">
        <script>
          (function() {
            var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
            var body = document.getElementById("projects-content");
            entries.forEach(function(entry) {
              var div = document.createElement("div");
              div.className = "entry-item";
              div.textContent = entry;
              body.appendChild(div);
            });
          })();
        </script>
      </div>
    </div>

    <div class="section-block" id="experience">
      <div class="section-header-row">
        <div class="section-index">03</div>
        <div class="section-title-wrap"><span class="section-title">Experience</span></div>
      </div>
      <div class="content-body" id="exp-content">
        <script>
          (function() {
            var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
            var body = document.getElementById("exp-content");
            entries.forEach(function(entry) {
              var div = document.createElement("div");
              div.className = "entry-item";
              div.textContent = entry;
              body.appendChild(div);
            });
          })();
        </script>
      </div>
    </div>

    <div class="section-block" id="education">
      <div class="section-header-row">
        <div class="section-index">04</div>
        <div class="section-title-wrap"><span class="section-title">Education</span></div>
      </div>
      <div class="content-body" id="edu-content">
        <script>
          (function() {
            var entries = "{{education}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
            var body = document.getElementById("edu-content");
            entries.forEach(function(entry) {
              var div = document.createElement("div");
              div.className = "entry-item";
              div.textContent = entry;
              body.appendChild(div);
            });
          })();
        </script>
      </div>
    </div>

    <div class="footer-block" id="contact">
      <div>
        <div class="footer-heading">Let's<br>talk.</div>
        <a href="mailto:{{email}}" class="footer-email">{{email}}</a>
      </div>
      <div>
        <a href="{{github}}" class="footer-link">{{github}}</a>
        <a href="{{linkedin}}" class="footer-link">{{linkedin}}</a>
        <a href="{{portfolio}}" class="footer-link">{{portfolio}}</a>
        <p style="font-size:0.8rem;color:rgba(247,244,239,0.3);margin-top:1rem;">{{phone}}</p>
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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&family=Manrope:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --bg: #1e1e2e; --surface: #252535; --surface2: #2a2a3d; --panel: #181825; --border: rgba(100,90,140,0.25); --text: #cdd6f4; --muted: #585b70; --subtle: #45475a; --kw: #cba6f7; --fn: #89b4fa; --str: #a6e3a1; --num: #fab387; --cmt: #6c7086; --type: #f38ba8; }
  body { background: var(--bg); color: var(--text); font-family: 'Manrope', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .title-bar { background: var(--panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0; height: 38px; position: sticky; top: 0; z-index: 100; }
  .title-dots { display: flex; gap: 6px; padding: 0 16px; border-right: 1px solid var(--border); align-items: center; height: 100%; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.red { background: #f38ba8; } .dot.yellow { background: #f9e2af; } .dot.green { background: #a6e3a1; }
  .tabs { display: flex; height: 100%; }
  .tab { display: flex; align-items: center; gap: 0.5rem; padding: 0 1.25rem; font-family: 'Fira Code', monospace; font-size: 0.72rem; color: var(--muted); border-right: 1px solid var(--border); }
  .tab.active { background: var(--bg); color: var(--text); }
  .editor-body { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 38px); }
  .file-tree { background: var(--panel); border-right: 1px solid var(--border); padding: 1.5rem 0; }
  .tree-label { font-family: 'Fira Code', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); padding: 0.3rem 1.25rem; margin-bottom: 0.5rem; }
  .tree-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 1.25rem; font-family: 'Fira Code', monospace; font-size: 0.78rem; color: var(--muted); }
  .code-panel { overflow: auto; }
  .hero-code { padding: 3rem; font-family: 'Fira Code', monospace; font-size: 0.88rem; line-height: 2; }
  .kw { color: var(--kw); } .fn { color: var(--fn); } .str { color: var(--str); } .num { color: var(--num); } .cmt { color: var(--cmt); font-style: italic; } .type { color: var(--type); }
  .hero-name-display { font-family: 'Manrope', sans-serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: var(--text); letter-spacing: -0.02em; line-height: 1; padding: 1rem 3rem 0.5rem; }
  .hero-name-display .accent { color: var(--kw); }
  .hero-subtitle { font-family: 'Fira Code', monospace; font-size: 0.9rem; color: var(--cmt); padding: 0 3rem 2rem; }
  .section { padding: 2.5rem 3rem; border-top: 1px solid var(--border); }
  .section-badge { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Fira Code', monospace; font-size: 0.72rem; color: var(--fn); background: rgba(137,180,250,0.1); border: 1px solid rgba(137,180,250,0.2); padding: 0.35rem 0.85rem; border-radius: 4px; margin-bottom: 1.5rem; }
  .section-h { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 2rem; color: var(--text); }
  .skill-pills { display: flex; flex-wrap: wrap; gap: 0.6rem; }
  .skill-pill { font-family: 'Fira Code', monospace; font-size: 0.72rem; padding: 0.3rem 0.75rem; border-radius: 4px; background: rgba(203,166,247,0.1); color: var(--kw); border: 1px solid rgba(203,166,247,0.2); }
  .entry-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .entry-item { background: var(--surface); padding: 1.5rem 1.75rem; transition: background 0.15s; font-size: 0.88rem; color: var(--muted); line-height: 1.75; }
  .entry-item:hover { background: var(--surface2); }
  .contact-section { background: var(--panel); border-top: 1px solid var(--border); padding: 3rem; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 600px; }
  .contact-link { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.5rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 0.35rem; transition: border-color 0.2s; }
  .contact-link:hover { border-color: rgba(137,180,250,0.4); }
  .contact-type { font-family: 'Fira Code', monospace; font-size: 0.65rem; color: var(--cmt); letter-spacing: 0.1em; }
  .contact-val { font-size: 0.88rem; font-weight: 600; color: var(--fn); word-break: break-all; }
  .status-bar-bottom { position: fixed; bottom: 0; left: 0; right: 0; background: var(--fn); display: flex; align-items: center; gap: 2rem; padding: 0.35rem 1.5rem; font-family: 'Fira Code', monospace; font-size: 0.7rem; color: var(--bg); z-index: 100; font-weight: 600; }
  @media (max-width: 780px) { .editor-body { grid-template-columns: 1fr; } .file-tree { display: none; } .contact-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="title-bar">
  <div class="title-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
  <div class="tabs">
    <div class="tab active">portfolio.ts</div>
    <div class="tab">experience.json</div>
    <div class="tab">README.md</div>
  </div>
</div>
<div class="editor-body">
  <nav class="file-tree">
    <div class="tree-label">Explorer</div>
    <div class="tree-item">📄 portfolio.ts</div>
    <div class="tree-item">📄 experience.json</div>
    <div class="tree-item">📁 projects/</div>
    <div class="tree-item">📄 README.md</div>
    <div style="border-top:1px solid var(--border);margin:1rem 0;"></div>
    <div class="tree-label">Skills</div>
    <div id="tree-skills"></div>
    <script>
      (function() {
        var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean).slice(0,5);
        var container = document.getElementById("tree-skills");
        skills.forEach(function(skill) {
          var div = document.createElement("div");
          div.className = "tree-item";
          div.textContent = "🔵 " + skill;
          container.appendChild(div);
        });
      })();
    </script>
  </nav>
  <div class="code-panel">
    <div class="hero-code">
      <div><span class="cmt">// portfolio.ts — {{name}}</span></div>
      <div>&nbsp;</div>
      <div><span class="kw">interface</span> <span class="type">Engineer</span> {</div>
      <div>&nbsp;&nbsp;<span class="fn">name</span>: <span class="type">string</span>;</div>
      <div>&nbsp;&nbsp;<span class="fn">role</span>: <span class="type">string</span>;</div>
      <div>&nbsp;&nbsp;<span class="fn">location</span>: <span class="type">string</span>;</div>
      <div>}</div>
      <div>&nbsp;</div>
      <div><span class="kw">const</span> <span class="fn">me</span>: <span class="type">Engineer</span> = {</div>
      <div>&nbsp;&nbsp;<span class="fn">name</span>: <span class="str">"{{name}}"</span>,</div>
      <div>&nbsp;&nbsp;<span class="fn">role</span>: <span class="str">"{{title}}"</span>,</div>
      <div>&nbsp;&nbsp;<span class="fn">location</span>: <span class="str">"{{location}}"</span>,</div>
      <div>};</div>
    </div>
    <div class="hero-name-display">{{name}}</div>
    <div class="hero-subtitle">// {{title}} · {{location}}</div>

    <section class="section" id="skills">
      <div class="section-badge">fn skills()</div>
      <h2 class="section-h">Technical Skills</h2>
      <div class="skill-pills" id="skills-pills"></div>
      <script>
        (function() {
          var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
          var container = document.getElementById("skills-pills");
          skills.forEach(function(skill) {
            var span = document.createElement("span");
            span.className = "skill-pill";
            span.textContent = skill;
            container.appendChild(span);
          });
        })();
      </script>
    </section>

    <section class="section" id="projects">
      <div class="section-badge">fn projects()</div>
      <h2 class="section-h">Projects</h2>
      <div class="entry-list" id="projects-list"></div>
      <script>
        (function() {
          var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var list = document.getElementById("projects-list");
          entries.forEach(function(entry) {
            var div = document.createElement("div");
            div.className = "entry-item";
            div.textContent = entry;
            list.appendChild(div);
          });
        })();
      </script>
    </section>

    <section class="section" id="experience">
      <div class="section-badge">fn experience()</div>
      <h2 class="section-h">Experience</h2>
      <div class="entry-list" id="exp-list"></div>
      <script>
        (function() {
          var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var list = document.getElementById("exp-list");
          entries.forEach(function(entry) {
            var div = document.createElement("div");
            div.className = "entry-item";
            div.textContent = entry;
            list.appendChild(div);
          });
        })();
      </script>
    </section>

    <section class="section" id="education">
      <div class="section-badge">fn education()</div>
      <h2 class="section-h">Education</h2>
      <div class="entry-list" id="edu-list"></div>
      <script>
        (function() {
          var entries = "{{education}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
          var list = document.getElementById("edu-list");
          entries.forEach(function(entry) {
            var div = document.createElement("div");
            div.className = "entry-item";
            div.textContent = entry;
            list.appendChild(div);
          });
        })();
      </script>
    </section>

    <section class="contact-section" id="contact">
      <div class="section-badge">fn contact()</div>
      <h2 class="section-h" style="margin-bottom:1.5rem">Get in Touch</h2>
      <div class="contact-grid">
        <a href="mailto:{{email}}" class="contact-link">
          <span class="contact-type">// email</span>
          <span class="contact-val">{{email}}</span>
        </a>
        <a href="{{github}}" class="contact-link">
          <span class="contact-type">// github</span>
          <span class="contact-val">{{github}}</span>
        </a>
        <a href="{{linkedin}}" class="contact-link">
          <span class="contact-type">// linkedin</span>
          <span class="contact-val">{{linkedin}}</span>
        </a>
        <div class="contact-link">
          <span class="contact-type">// phone</span>
          <span class="contact-val">{{phone}}</span>
        </div>
      </div>
    </section>
  </div>
</div>
<div class="status-bar-bottom">
  <span>TypeScript</span>
  <span>·</span>
  <span>{{name}}</span>
  <span>·</span>
  <span>{{location}}</span>
  <span>·</span>
  <span>Open to opportunities</span>
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
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --cream: #faf8f3; --dark: #111010; --mid: #444; --light: #bbb; --rule: rgba(0,0,0,0.12); --hot: #c84b11; --cool: #1a4faa; }
  body { background: var(--cream); color: var(--dark); font-family: 'IBM Plex Sans', sans-serif; overflow-x: hidden; }
  .masthead { border-bottom: 3px solid var(--dark); }
  .masthead-top { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 3rem; border-bottom: 1px solid var(--rule); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mid); }
  .issue-num { color: var(--hot); }
  .masthead-main { display: flex; align-items: center; padding: 2rem 3rem; gap: 2rem; }
  .masthead-rule { width: 4px; height: 80px; background: var(--hot); flex-shrink: 0; }
  .masthead-title { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
  .masthead-tagline { font-size: 0.8rem; color: var(--mid); font-style: italic; font-family: 'Playfair Display', serif; }
  .masthead-nav { display: flex; gap: 0; border-top: 1px solid var(--rule); background: var(--dark); }
  .masthead-nav a { padding: 0.85rem 2rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; color: rgba(255,255,255,0.5); border-right: 1px solid rgba(255,255,255,0.08); transition: color 0.15s, background 0.15s; }
  .masthead-nav a:hover { color: #fff; background: rgba(255,255,255,0.05); }
  .front-page { display: grid; grid-template-columns: 2fr 1fr; border-bottom: 2px solid var(--dark); }
  .lead-story { border-right: 1px solid var(--rule); padding: 3rem; display: flex; flex-direction: column; justify-content: flex-end; min-height: 480px; background: var(--dark); color: #fff; }
  .lead-kicker { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--hot); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
  .lead-kicker::before { content: ''; width: 20px; height: 2px; background: var(--hot); flex-shrink: 0; }
  .lead-headline { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.5rem; }
  .lead-deck { font-size: 1rem; line-height: 1.75; color: rgba(255,255,255,0.65); max-width: 480px; margin-bottom: 2.5rem; font-weight: 300; }
  .lead-byline { display: flex; align-items: center; gap: 1rem; }
  .byline-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--hot); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #fff; flex-shrink: 0; }
  .byline-text { font-size: 0.82rem; color: rgba(255,255,255,0.5); }
  .byline-name { color: #fff; font-weight: 600; display: block; margin-bottom: 0.15rem; }
  .sidebar-stories { display: flex; flex-direction: column; }
  .sidebar-story { border-bottom: 1px solid var(--rule); padding: 2rem; flex: 1; transition: background 0.15s; }
  .sidebar-story:last-child { border-bottom: none; }
  .sidebar-story:hover { background: rgba(0,0,0,0.02); }
  .story-kicker { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--cool); margin-bottom: 0.6rem; }
  .story-head { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; line-height: 1.25; margin-bottom: 0.5rem; }
  .story-deck { font-size: 0.82rem; color: var(--mid); line-height: 1.65; }
  .content-area { max-width: 1100px; margin: 0 auto; padding: 0 3rem; }
  .feature-section { padding: 3rem 0; border-bottom: 2px solid var(--dark); }
  .feature-label { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mid); margin-bottom: 2rem; }
  .feature-label::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
  .skill-tag { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cool); border: 1px solid rgba(26,79,170,0.25); padding: 0.3rem 0.7rem; display: inline-block; margin: 0.25rem; }
  .entry-block { border-top: 2px solid var(--dark); padding-top: 1.5rem; margin-bottom: 2rem; transition: border-color 0.2s; }
  .entry-block:hover { border-top-color: var(--hot); }
  .entry-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; line-height: 1.15; margin-bottom: 0.6rem; }
  .entry-body { font-size: 0.85rem; color: var(--mid); line-height: 1.8; }
  .footer { background: var(--dark); color: rgba(255,255,255,0.75); padding: 4rem 3rem; display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; align-items: start; }
  .footer-brand { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 1rem; line-height: 1; }
  .footer-bio { font-size: 0.85rem; line-height: 1.8; color: rgba(255,255,255,0.4); }
  .footer-right { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
  .footer-col-head { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .footer-link { display: block; font-size: 0.88rem; color: rgba(255,255,255,0.55); text-decoration: none; margin-bottom: 0.6rem; transition: color 0.15s; word-break: break-all; }
  .footer-link:hover { color: #fff; }
  .footer-email { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #fff; font-style: italic; text-decoration: none; border-bottom: 1px solid rgba(200,75,17,0.4); padding-bottom: 0.15rem; transition: border-color 0.2s; word-break: break-all; }
  .footer-email:hover { border-color: var(--hot); }
  @media (max-width: 900px) { .front-page { grid-template-columns: 1fr; } .footer { grid-template-columns: 1fr; } .footer-right { grid-template-columns: 1fr; } .content-area { padding: 0 1.5rem; } }
</style>
</head>
<body>
<header class="masthead">
  <div class="masthead-top">
    <span>{{title}} Portfolio</span>
    <span><span class="issue-num">Vol. 2025</span> · {{location}}</span>
    <span>Open to Opportunities</span>
  </div>
  <div class="masthead-main">
    <div class="masthead-rule"></div>
    <div>
      <div class="masthead-title">{{name}}</div>
      <div class="masthead-tagline">{{title}} — Building Things That Matter</div>
    </div>
  </div>
  <nav class="masthead-nav">
    <a href="#skills">Skills</a>
    <a href="#projects">Projects</a>
    <a href="#experience">Experience</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<div class="front-page">
  <div class="lead-story">
    <div class="lead-kicker">Featured Profile</div>
    <h1 class="lead-headline">{{name}}</h1>
    <p class="lead-deck">{{summary}}</p>
    <div class="lead-byline">
      <div class="byline-avatar" id="byline-init"></div>
      <script>(function(){var n="{{name}}",i=n.split(" ").map(function(w){return w[0]||""}).slice(0,2).join("").toUpperCase();document.getElementById("byline-init").textContent=i||n[0]||"?"})();</script>
      <div class="byline-text">
        <span class="byline-name">{{name}}</span>
        {{title}} · {{location}} · Open to Roles
      </div>
    </div>
  </div>
  <div class="sidebar-stories">
    <div class="sidebar-story">
      <div class="story-kicker">Location</div>
      <div class="story-head">{{location}}</div>
      <p class="story-deck">{{email}} · {{phone}}</p>
    </div>
    <div class="sidebar-story">
      <div class="story-kicker">Specialisation</div>
      <div class="story-head">{{title}}</div>
      <p class="story-deck">{{summary}}</p>
    </div>
    <div class="sidebar-story">
      <div class="story-kicker">Education</div>
      <div class="story-head" id="edu-sidebar"></div>
      <script>
        (function() {
          var edu = "{{education}}".split("|")[0].trim();
          document.getElementById("edu-sidebar").textContent = edu;
        })();
      </script>
    </div>
  </div>
</div>

<div class="content-area">
  <section class="feature-section" id="skills">
    <div class="feature-label">Technical Skills</div>
    <div id="skills-tags"></div>
    <script>
      (function() {
        var skills = "{{skills}}".split(",").map(function(s){ return s.trim(); }).filter(Boolean);
        var container = document.getElementById("skills-tags");
        skills.forEach(function(skill) {
          var span = document.createElement("span");
          span.className = "skill-tag";
          span.textContent = skill;
          container.appendChild(span);
        });
      })();
    </script>
  </section>

  <section class="feature-section" id="projects">
    <div class="feature-label">Selected Projects</div>
    <div id="projects-entries"></div>
    <script>
      (function() {
        var entries = "{{projects}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var container = document.getElementById("projects-entries");
        entries.forEach(function(entry, i) {
          var parts = entry.split(":");
          var title = parts[0] ? parts[0].trim() : "Project " + (i+1);
          var desc = parts.slice(1).join(":").trim();
          var div = document.createElement("div");
          div.className = "entry-block";
          div.innerHTML = '<div class="entry-title">' + title + '</div><p class="entry-body">' + (desc || entry) + '</p>';
          container.appendChild(div);
        });
      })();
    </script>
  </section>

  <section class="feature-section" id="experience">
    <div class="feature-label">Career Timeline</div>
    <div id="exp-entries"></div>
    <script>
      (function() {
        var entries = "{{experience}}".split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        var container = document.getElementById("exp-entries");
        entries.forEach(function(entry) {
          var div = document.createElement("div");
          div.className = "entry-block";
          div.innerHTML = '<p class="entry-body">' + entry + '</p>';
          container.appendChild(div);
        });
      })();
    </script>
  </section>
</div>

<footer class="footer" id="contact">
  <div>
    <div class="footer-brand">{{name}}</div>
    <p class="footer-bio">{{summary}}</p>
  </div>
  <div class="footer-right">
    <div>
      <div class="footer-col-head">Contact</div>
      <a href="mailto:{{email}}" class="footer-email">{{email}}</a>
    </div>
    <div>
      <div class="footer-col-head">Profiles</div>
      <a href="{{github}}" class="footer-link">{{github}}</a>
      <a href="{{linkedin}}" class="footer-link">{{linkedin}}</a>
      <a href="{{portfolio}}" class="footer-link">{{portfolio}}</a>
    </div>
  </div>
</footer>
</body>
</html>
`,
  },
  {
    id: "deep-dark-minimal",
    name: "Deep Dark Minimal",
    style: "Dark Recruiter",
    premium: false,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{name}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #090910; --bg-2: #0f0f1a; --bg-3: #16162a; --bg-card: #111120;
    --border: #1e1e35; --border-2: #2a2a45;
    --accent: #4f8ef7; --accent-light: rgba(79,142,247,0.12); --accent-hover: #6aa0ff;
    --text: #eeeef8; --text-2: #9090b8; --text-3: #555575;
    --radius: 14px; --radius-sm: 8px;
    --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94); --speed: 0.22s;
  }
  html { scroll-behavior: smooth; scroll-padding-top: 70px; }
  body { background: var(--bg); color: var(--text); font-family: 'Poppins', sans-serif; font-size: 15px; line-height: 1.7; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  a { text-decoration: none; color: inherit; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

  /* Navbar */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(9,9,16,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-family: 'Montserrat', sans-serif; font-size: 1.4rem; font-weight: 900; color: var(--text); letter-spacing: -1px; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; align-items: center; gap: 0.25rem; list-style: none; }
  .nav-link { padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 500; color: var(--text-2); border-radius: 6px; transition: color var(--speed), background var(--speed); }
  .nav-link:hover { color: var(--text); background: var(--accent-light); }
  .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 0.4rem; }
  .hamburger span { display: block; width: 22px; height: 2px; background: var(--text-2); border-radius: 2px; transition: all 0.3s; }

  /* Hero */
  .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; overflow: hidden; padding-top: 64px; }
  .hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.16; }
  .blob-1 { width: 500px; height: 500px; background: var(--accent); top: -80px; right: -80px; animation: blobFloat 8s ease-in-out infinite; }
  .blob-2 { width: 360px; height: 360px; background: #7c3aed; bottom: 60px; left: -80px; animation: blobFloat 10s ease-in-out infinite reverse; }
  @keyframes blobFloat { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.05); } }
  .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 60px 60px; opacity: 0.22; mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%); }
  .hero-inner { position: relative; z-index: 1; max-width: 1100px; width: 100%; margin: 0 auto; padding: 0 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; min-height: calc(100vh - 64px); justify-content: center; }
  .hero-content { animation: fadeUp 0.8s var(--ease) both; max-width: 700px; }
  .hero-greeting { font-size: 1rem; font-weight: 500; color: var(--text-2); margin-bottom: 0.75rem; }
  .hero-name { font-family: 'Montserrat', sans-serif; font-size: clamp(2.6rem, 6vw, 4.8rem); font-weight: 900; line-height: 1.05; letter-spacing: -2px; color: var(--text); margin-bottom: 1.25rem; }
  .hero-name em { font-style: normal; color: var(--accent); }
  .hero-tagline { font-size: 0.97rem; color: var(--text-2); line-height: 1.8; margin-bottom: 2rem; }
  .hero-actions { display: flex; gap: 0.85rem; flex-wrap: wrap; margin-bottom: 2.5rem; justify-content: center; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.6rem; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all var(--speed) var(--ease); border: none; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,142,247,0.35); }
  .btn-outline { background: transparent; color: var(--text); border: 1.5px solid var(--border-2); }
  .btn-outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .hero-socials { display: flex; gap: 0.85rem; justify-content: center; }
  .hero-socials a { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border-2); border-radius: 8px; color: var(--text-2); font-size: 1rem; transition: all var(--speed); }
  .hero-socials a:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); transform: translateY(-3px); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

  /* Sections */
  .section { padding: 5rem 0; }
  .section-alt { background: var(--bg-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .section-label { font-size: 0.72rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 0.6rem; }
  .section-title { font-family: 'Montserrat', sans-serif; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; letter-spacing: -1px; color: var(--text); margin-bottom: 2.5rem; }
  .section-title em { font-style: normal; color: var(--accent); }

  /* About */
  .about-text { max-width: 720px; }
  .about-text p { color: var(--text-2); margin-bottom: 0.9rem; font-size: 0.95rem; }

  /* Skills */
  .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; }
  .skill-category { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; transition: border-color var(--speed); }
  .skill-category:hover { border-color: var(--border-2); }
  .skill-cat-title { font-family: 'Montserrat', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .skill-tag { padding: 0.3rem 0.75rem; background: var(--bg-3); border: 1px solid var(--border); border-radius: 20px; font-size: 0.78rem; font-weight: 500; color: var(--text-2); }

  /* Projects */
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 1.25rem; }
  .project-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.7rem; transition: transform var(--speed), border-color var(--speed), box-shadow var(--speed); }
  .project-card:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 12px 40px rgba(79,142,247,0.1); }
  .project-name { font-family: 'Montserrat', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text); }
  .project-desc { font-size: 0.82rem; color: var(--text-2); line-height: 1.65; flex: 1; }
  .project-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .project-tech span { font-size: 0.68rem; font-weight: 600; padding: 0.2rem 0.6rem; background: var(--bg-3); border: 1px solid var(--border); border-radius: 4px; color: var(--text-3); }
  .project-links { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .project-links a { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.48rem 1rem; border-radius: 7px; font-size: 0.77rem; font-weight: 600; border: 1.5px solid var(--border-2); color: var(--text-2); transition: all var(--speed); }
  .project-links a:hover { color: var(--text); background: var(--bg-3); }
  .project-links a.primary-link { background: var(--accent); border-color: var(--accent); color: #fff; }
  .project-links a.primary-link:hover { background: var(--accent-hover); }

  /* Education */
  .edu-list { display: flex; flex-direction: column; gap: 1rem; max-width: 720px; }
  .edu-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
  .edu-title { font-family: 'Montserrat', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--text); }
  .edu-detail { font-size: 0.85rem; color: var(--text-2); margin-top: 0.3rem; }

  /* Contact */
  .contact-intro { font-size: 0.95rem; color: var(--text-2); margin-bottom: 2rem; max-width: 540px; }
  .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; }
  .contact-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); transition: all var(--speed); }
  .contact-card:hover { border-color: var(--accent); background: var(--accent-light); transform: translateY(-3px); }
  .contact-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; background: var(--accent-light); border-radius: 8px; flex-shrink: 0; color: var(--accent); font-size: 1.1rem; }
  .contact-label { font-size: 0.85rem; font-weight: 600; }
  .contact-value { font-size: 0.78rem; color: var(--text-2); }

  /* Footer */
  .footer { padding: 1.75rem 0; border-top: 1px solid var(--border); text-align: center; }
  .footer p { font-size: 0.82rem; color: var(--text-3); }

  /* Responsive */
  @media (max-width: 768px) {
    .nav-links { display: none; position: absolute; top: 64px; left: 0; right: 0; background: rgba(9,9,16,0.97); border-bottom: 1px solid var(--border); flex-direction: column; padding: 1rem; gap: 0.25rem; }
    .nav-links.open { display: flex; }
    .hamburger { display: flex; }
    .hero-inner { padding: 2rem 1.25rem 5rem; min-height: auto; }
    .hero-name { font-size: 2.6rem; }
    .section { padding: 4rem 0; }
    .container { padding: 0 1.25rem; }
    .projects-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .hero-name { font-size: 2.2rem; }
    .hero-actions { flex-direction: column; align-items: center; }
    .btn { width: 100%; justify-content: center; }
  }
</style>
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="#home" class="nav-logo">{{name}}<span>.</span></a>
      <ul class="nav-links" id="nav-links">
        <li><a href="#home" class="nav-link">Home</a></li>
        <li><a href="#about" class="nav-link">About</a></li>
        <li><a href="#skills" class="nav-link">Skills</a></li>
        <li><a href="#projects" class="nav-link">Projects</a></li>
        <li><a href="#education" class="nav-link">Education</a></li>
        <li><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero" id="home">
    <div class="hero-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>
    <div class="hero-inner">
      <div class="hero-content">
        <p class="hero-greeting">Hello, I'm</p>
        <h1 class="hero-name"><em>{{name}}</em></h1>
        <p class="hero-tagline">{{title}}<br>{{summary}}</p>
        <div class="hero-actions">
          <a href="#projects" class="btn btn-primary">View Projects</a>
          <a href="#contact" class="btn btn-outline">Contact Me</a>
        </div>
        <div class="hero-socials">
          <a href="{{github}}" target="_blank" rel="noopener" aria-label="GitHub">GH</a>
          <a href="{{linkedin}}" target="_blank" rel="noopener" aria-label="LinkedIn">LI</a>
          <a href="mailto:{{email}}" aria-label="Email">@</a>
        </div>
      </div>
    </div>
  </section>

  <!-- About -->
  <section class="section" id="about">
    <div class="container">
      <div class="section-label">01 / About</div>
      <h2 class="section-title">About <em>Me</em></h2>
      <div class="about-text">
        <p>{{summary}}</p>
      </div>
    </div>
  </section>

  <!-- Skills -->
  <section class="section section-alt" id="skills">
    <div class="container">
      <div class="section-label">02 / Skills</div>
      <h2 class="section-title">Technical <em>Skills</em></h2>
      <div class="skills-grid" id="skills-container"></div>
    </div>
  </section>

  <!-- Projects -->
  <section class="section" id="projects">
    <div class="container">
      <div class="section-label">03 / Projects</div>
      <h2 class="section-title">My <em>Projects</em></h2>
      <div class="projects-grid" id="projects-container"></div>
    </div>
  </section>

  <!-- Education -->
  <section class="section section-alt" id="education">
    <div class="container">
      <div class="section-label">04 / Education</div>
      <h2 class="section-title">Education</h2>
      <div class="edu-list" id="education-container"></div>
    </div>
  </section>

  <!-- Contact -->
  <section class="section" id="contact">
    <div class="container">
      <div class="section-label">05 / Contact</div>
      <h2 class="section-title">Get In <em>Touch</em></h2>
      <p class="contact-intro">I'm open to opportunities and collaborations. Feel free to reach out.</p>
      <div class="contact-grid">
        <a href="mailto:{{email}}" class="contact-card">
          <div class="contact-icon">@</div>
          <div><div class="contact-label">Email</div><div class="contact-value">{{email}}</div></div>
        </a>
        <a href="{{linkedin}}" target="_blank" class="contact-card">
          <div class="contact-icon">in</div>
          <div><div class="contact-label">LinkedIn</div><div class="contact-value">{{linkedin}}</div></div>
        </a>
        <a href="{{github}}" target="_blank" class="contact-card">
          <div class="contact-icon">&lt;/&gt;</div>
          <div><div class="contact-label">GitHub</div><div class="contact-value">{{github}}</div></div>
        </a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p>Designed and built by {{name}}</p>
    </div>
  </footer>

  <script>
    // Navbar scroll shadow
    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
      navbar.style.boxShadow = window.scrollY > 30 ? '0 4px 30px rgba(0,0,0,0.4)' : 'none';
    });

    // Hamburger toggle
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('nav-links');
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() { navLinks.classList.remove('open'); });
    });

    // Render skills
    (function() {
      var skills = "{{skills}}".split(",").map(function(s) { return s.trim(); }).filter(Boolean);
      var container = document.getElementById('skills-container');
      if (skills.length > 0) {
        var card = document.createElement('div');
        card.className = 'skill-category';
        card.innerHTML = '<div class="skill-cat-title">Skills</div><div class="skill-tags">' +
          skills.map(function(s) { return '<span class="skill-tag">' + s + '</span>'; }).join('') + '</div>';
        container.appendChild(card);
      }
    })();

    // Render projects
    (function() {
      var entries = "{{projects}}".split("|").map(function(s) { return s.trim(); }).filter(Boolean);
      var container = document.getElementById('projects-container');
      entries.forEach(function(entry) {
        var parts = entry.split(" - ");
        var title = parts[0] || entry;
        var desc = parts.slice(1).join(" - ") || "";
        var card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = '<div class="project-name">' + title + '</div>' +
          (desc ? '<div class="project-desc">' + desc + '</div>' : '');
        container.appendChild(card);
      });
    })();

    // Render education
    (function() {
      var entries = "{{education}}".split("|").map(function(s) { return s.trim(); }).filter(Boolean);
      var container = document.getElementById('education-container');
      entries.forEach(function(entry) {
        var parts = entry.split(" - ");
        var title = parts[0] || entry;
        var detail = parts.slice(1).join(" - ") || "";
        var item = document.createElement('div');
        item.className = 'edu-item';
        item.innerHTML = '<div class="edu-title">' + title + '</div>' +
          (detail ? '<div class="edu-detail">' + detail + '</div>' : '');
        container.appendChild(item);
      });
    })();
  </script>
</body>
</html>
`,
  },
];