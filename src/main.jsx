import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Github, Linkedin, Mail, ExternalLink, Search } from 'lucide-react';
import { projects } from './data/projects.js';
import './styles.css';

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
          <Github size={18} /> GitHub
        </a>
        <a className="button secondary" href="https://linkedin.com/" target="_blank" rel="noreferrer">
          <Linkedin size={18} /> LinkedIn
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
          {project.github && <a href={project.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>}
          {project.linkedin && <a href={project.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>}
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
        <a href="https://github.com/" target="_blank" rel="noreferrer"><Github size={18} /> GitHub</a>
        <a href="https://linkedin.com/" target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
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
