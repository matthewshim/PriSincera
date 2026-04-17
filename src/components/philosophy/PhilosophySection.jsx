import BeliefIntro from './PhilosophyIntro';
import BeliefCards from './ConceptCards';
import useScrollReveal from '../../hooks/useScrollReveal';
import './PhilosophySection.css';

/**
 * Belief Section — personal philosophy and core convictions.
 * Merges the original Philosophy (CI story) and Belief (personal values)
 * into a single powerful section.
 *
 * Layout: Left narrative intro + brand declaration / Right: three belief cards.
 */
export default function BeliefSection() {
  const sectionRef = useScrollReveal({ threshold: 0.08 });

  return (
    <section className="philosophy reveal-section" id="belief" ref={sectionRef}>
      <div className="philosophy-container">
        <div className="section-label">Belief</div>
        <div className="philosophy-layout">
          <BeliefIntro />
          <BeliefCards />
        </div>
      </div>
    </section>
  );
}

