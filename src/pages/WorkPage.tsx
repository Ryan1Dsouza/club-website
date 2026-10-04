import { ArrowUpRight, Github } from 'lucide-react';
import type { Project, SiteSettings } from '../types';
import { Reveal } from '../components/ui/reveal';
import LaundroidProject from '../components/work/LaundroidProject';
import './showcase.css';

function ProjectArtwork({ project, index }: { project: Project; index: number }) {
  return <div className="work-art" aria-hidden="true">
    <div className="work-art-grid" />
    <span className="work-art-index">N / {String(index + 1).padStart(2, '0')}</span>
    <div className="work-orbit work-orbit--outer" /><div className="work-orbit work-orbit--inner" />
    <div className="work-monogram">{project.title.slice(0, 1)}</div>
    <div className="work-art-caption"><span>{project.title}</span><span>{project.domain}</span></div>
  </div>;
}

export default function WorkPage({ projects, settings }: { projects: Project[]; settings: SiteSettings }) {
  return <section className="showcase-page work-page section-wrap" aria-labelledby="work-title">
    <h1 id="work-title" className="sr-only">Our work</h1>
    <div className="work-list">{projects.map((project, index) => <Reveal key={project.id}>
      {project.id === 'i-laundroid' ? <LaundroidProject project={project} settings={settings} index={index} /> : <article className="work-feature" aria-labelledby={`project-${project.id}`}>
        <ProjectArtwork project={project} index={index} />
        <div className="work-copy">
          <div className="work-meta"><span>{project.domain}</span><span className="status-dot">{project.status}</span></div>
          <h2 id={`project-${project.id}`}>{project.title}</h2>
          <p>{project.description}</p>
          <div className="work-links">
            {project.url && <a className="button primary" href={project.url} target="_blank" rel="noreferrer">Explore project <ArrowUpRight size={17} /></a>}
            {project.repositoryUrl && <a className="text-link" href={project.repositoryUrl} target="_blank" rel="noreferrer">Source code <Github size={17} /></a>}
            {!project.url && !project.repositoryUrl && <a className="text-link" href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(`Tell me about ${project.title}`)}`}>About this project <ArrowUpRight size={18} /></a>}
          </div>
        </div>
      </article>}
    </Reveal>)}</div>
    {!projects.length && <div className="empty-state"><p>New projects are taking shape.</p><a className="text-link" href={settings.githubUrl} target="_blank" rel="noreferrer">Follow on GitHub <ArrowUpRight size={17} /></a></div>}

  </section>;
}
