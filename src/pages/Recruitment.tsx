import type { SiteSettings } from '../types';
import { Reveal } from '../components/ui/reveal';
import RecruitmentApplication from '../components/recruitment/RecruitmentApplication';

export default function Recruitment({ settings }: { settings: SiteSettings }) {
  return <section className="recruitment-page recruitment-page--application section-wrap">
    <Reveal stagger={80}><span className="eyebrow" data-reveal-item>Your next chapter</span><h1 data-reveal-item>Find your<br /><em>people.</em></h1>
      <p data-reveal-item>Bring your curiosity. Let’s build something together.</p>
    </Reveal>
    <RecruitmentApplication initialSettings={settings} />
  </section>;
}
