/**
 * ReLearn GA4 퍼널 계측 (Phase D)
 *
 * 퍼널: relearn_learn_view → relearn_orbit_add → relearn_complete_toggle → relearn_reflect_save
 * 보조: relearn_channel_select · relearn_view_records · relearn_subscribe · relearn_login_cta
 *
 * 이 수치가 §7 "루프 완주율"의 측정 수단이며, Phase E 일몰 게이트 판정 근거가 된다.
 * GA 미초기화/차단 환경에서도 앱 동작에 영향 없음(best-effort).
 */
import ReactGA from 'react-ga4';

export function trackRelearn(eventName, params = {}) {
  try {
    if (ReactGA.isInitialized) {
      ReactGA.event(eventName, params);
    }
  } catch { /* 계측 실패는 무시 */ }
}
