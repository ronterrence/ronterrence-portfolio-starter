import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, ExternalLink, Search } from 'lucide-react';
import { projects } from './data/projects.js';
import './styles.css';

function SvgIcon({ children, size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function GitHubIcon({ size }) {
  return (
    <SvgIcon size={size}>
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.55 2.35 1.1 2.92.84.09-.67.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.28 9.28 0 0 1 12 6.82c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.67.95.67 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </SvgIcon>
  );
}

function LinkedInIcon({ size }) {
  return (
    <SvgIcon size={size}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </SvgIcon>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Home">
        <span className="brand-mark">RU</span>
        <span>Ronterrence Projects</span>
      </a>
      <nav>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <p className="eyebrow">Builder portfolio · AI · fintech · digital heritage · civic systems</p>
      <h1>A living archive of products, prototypes, ideas, and experiments.</h1>
      <p className="hero-copy">
        I build and explore projects at the intersection of technology, African systems, culture, governance,
        digital memory, payments, and applied AI.
      </p>
      <div className="hero-actions">
        <a className="button primary" href="#projects">View projects</a>
        <a className="button secondary" href="https://github.com/" target="_blank" rel="noreferrer">
          <GitHubIcon size={18} /> GitHub
        </a>
        <a className="button secondary" href="https://linkedin.com/" target="_blank" rel="noreferrer">
          <LinkedInIcon size={18} /> LinkedIn
        </a>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-image" aria-hidden="true">
        <span>{project.initials}</span>
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>{project.category}</span>
          <span>{project.status}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.tagline}</p>
        <div className="tags">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <details>
          <summary>About this project</summary>
          <p>{project.description}</p>
        </details>
        <div className="project-links">
          {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GitHubIcon size={16} /> GitHub</a>}
          {project.linkedin && <a href={project.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon size={16} /> LinkedIn</a>}
          {project.demo && <a href={project.demo} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Demo</a>}
        </div>
      </div>
    </article>
  );
}

function Projects() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(projects.map((project) => project.category))];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchable = `${project.name} ${project.tagline} ${project.category} ${project.tags.join(' ')} ${project.description}`.toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase());
      const matchesCategory = category === 'All' || project.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <section className="section" id="projects">
      <div className="section-heading">
        <p className="eyebrow">Selected work</p>
        <h2>Projects</h2>
        <p>Replace these sample entries with your GitHub links, LinkedIn posts, screenshots, live demos, and case studies.</p>
      </div>

      <div className="filters">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." />
        </label>
        <div className="category-tabs">
          {categories.map((item) => (
            <button key={item} className={item === category ? 'active' : ''} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="project-grid">
        {filteredProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section about" id="about">
      <div>
        <p className="eyebrow">About</p>
        <h2>Built as a clear home for many directions.</h2>
      </div>
      <p>
        This portfolio is designed for a multi-project builder: some ideas are live products, some are prototypes,
        some are research concepts, and some are campaigns. The goal is to make them feel coherent, searchable,
        and easy to share.
      </p>
    </section>
  );
}

function Contact() {
  return (
    <section className="section contact" id="contact">
      <p className="eyebrow">Contact</p>
      <h2>Let’s connect.</h2>
      <div className="contact-links">
        <a href="mailto:ronterrence@gmail.com"><Mail size={18} /> ronterrence@gmail.com</a>
        <a href="https://github.com/" target="_blank" rel="noreferrer"><GitHubIcon size={18} /> GitHub</a>
        <a href="https://linkedin.com/" target="_blank" rel="noreferrer"><LinkedInIcon size={18} /> LinkedIn</a>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <footer>
        <span>© {new Date().getFullYear()} Ronterrence Udom</span>
        <span>Built with React, Vite, and Vercel.</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
