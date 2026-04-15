import PhilosophyIntro from './PhilosophyIntro';
import ConceptCards from './ConceptCards';
import useScrollReveal from '../../hooks/useScrollReveal';
import './PhilosophySection.css';

/**
 * Philosophy Section — brand storytelling below the hero.
 * Left: narrative intro / Right: three concept cards.
 */
export default function PhilosophySection() {
  const sectionRef = useScrollReveal({ threshold: 0.08 });

  return (
    <section className="philosophy reveal-section" id="philosophy" ref={sectionRef}>
      <div className="philosophy-container">
        <div className="section-label">Core Philosophy</div>
        <div className="philosophy-layout">
          <PhilosophyIntro />
          <ConceptCards />
        </div>
      </div>
    </section>
  );
}
