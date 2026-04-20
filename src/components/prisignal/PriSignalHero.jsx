import SubscribeForm from './SubscribeForm';
import '../prisignal/SubscribeForm.css';

/**
 * PriSignal Hero — ① Hero section with tagline and subscribe form.
 */
export default function PriSignalHero() {
  return (
    <section className="prisignal-section prisignal-hero" id="priSignalHero">
      <div className="prisignal-section-inner">
        <div className="prisignal-hero-icon">📡</div>
        <h1 className="prisignal-hero-title">
          Pri<span className="accent">Signal</span>
        </h1>
        <p className="prisignal-hero-tagline">
          노이즈 속에서 시그널을 포착하다
        </p>
        <p className="prisignal-hero-sub">
          20년차 PO가 매주 골라내는 태도와 트렌드의 교차점
        </p>
        <SubscribeForm variant="inline" />
      </div>
    </section>
  );
}
