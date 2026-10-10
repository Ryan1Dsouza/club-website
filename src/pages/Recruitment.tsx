import type { SiteSettings } from '../types';
import RecruitmentApplication from '../components/recruitment/RecruitmentApplication';

export default function Recruitment({ settings }: { settings: SiteSettings }) {
  return <section className="recruitment-page recruitment-page--application section-wrap">
    <header className="recruitment-heading">
      
      <h1>Recruitment</h1>
    </header>
    <RecruitmentApplication initialSettings={settings} />
  </section>;
}
