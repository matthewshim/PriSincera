import SubscribeForm from './SubscribeForm';

/**
 * PriSignal Subscribe CTA — ⑤ Repeated subscribe call-to-action.
 */
export default function PriSignalSubscribe() {
  return (
    <section className="prisignal-section prisignal-cta" id="priSignalCTA">
      <div className="prisignal-section-inner">
        <div className="prisignal-cta-container">
          <h2 className="prisignal-cta-title"><span className="accent">시그널</span>을 놓치지 마세요</h2>
          <p className="prisignal-cta-sub">
            매주 월요일, 커피 한 잔과 함께 읽는 인사이트 큐레이션
          </p>
          <SubscribeForm variant="inline" />
        </div>
      </div>
    </section>
  );
}
