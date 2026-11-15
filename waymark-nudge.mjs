// Waymark 먼저 찾아옴 발송 Job (M1-B.1) — Cloud Run Job (prisincera-web 이미지로 실행).
// 도래 decisionEvents 조회 → 종료/조용시간 체크 → 동반 메시지+알림 기록 → 이메일 발송 → status=sent.
// 실행: node waymark-nudge.mjs  (로컬은 ADC 필요: gcloud auth application-default login)
// 웹푸시(FCM)는 M1-B.2에서 추가. 정본: docs/waymark/mvp_build_plan.md §5
import { FieldValue } from 'firebase-admin/firestore';
import { db, auth } from './pipeline/src/lib/firestore.mjs';
import { sendEmail } from './pipeline/src/lib/mailer.mjs';
import { COLLECTIONS } from './src/data/waymarkModel.mjs';

const APP_BASE = 'https://www.prisincera.com/waymark/app';

// 이메일 카피 (type × locale). {title} 치환. 서버 렌더(이메일은 React 클라가 아님).
const EMAIL = {
  ko: {
    checkin: { subject: '그 결정, 어떻게 지내고 있어요?', line: '"{title}", 그 결정 이후 어떻게 지내고 있어요? 잠깐 안부가 궁금했어요.' },
    midterm: { subject: '그 결정, 중간쯤 왔어요', line: '"{title}", 중간쯤 왔습니다. 지금 마음은 어떤가요?' },
    retro:   { subject: '한 달 전 그 갈림길, 지금 돌아보면 어때요?', line: '"{title}" — 한 달쯤 지났어요. 지금 돌아보면 어떤가요?' },
    cta: '앱에서 이어서 이야기하기', foot: 'Waymark은 대신 결정하지 않아요. 곁에서 함께 돌아볼 뿐이에요.',
  },
  en: {
    checkin: { subject: 'How are you doing with that decision?', line: '"{title}" — how have you been since that decision? Just wanted to check in.' },
    midterm: { subject: "You're about halfway", line: '"{title}" — you’re about halfway. How does it feel now?' },
    retro:   { subject: 'Looking back a month later', line: '"{title}" — it’s been about a month. How do you see it now?' },
    cta: 'Continue in the app', foot: 'Waymark never decides for you. It just looks back with you.',
  },
  ja: {
    checkin: { subject: 'あの決断、その後どうですか？', line: '「{title}」、あの決断の後どうしていますか？ 少し気になりました。' },
    midterm: { subject: 'あの決断、半ばまで来ました', line: '「{title}」、半ばまで来ました。今の気持ちはどうですか？' },
    retro:   { subject: '一ヶ月前のあの分かれ道、振り返ってどうですか？', line: '「{title}」— 一ヶ月ほど経ちました。今振り返ってどうですか？' },
    cta: 'アプリで続ける', foot: 'Waymarkは代わりに決めません。そばで一緒に振り返るだけです。',
  },
};

function renderHtml(locale, type, title, href) {
  const L = (EMAIL[locale] || EMAIL.ko);
  const line = L[type].line.replace('{title}', title);
  return `<div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;line-height:1.6;padding:24px">
  <div style="font-size:18px;font-weight:600;color:#6366f1;margin-bottom:16px">Waymark</div>
  <p style="font-size:16px;margin:0 0 24px">${line}</p>
  <a href="${href}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:6px">${L.cta} &rarr;</a>
  <p style="font-size:12px;color:#8a8aa0;margin:28px 0 0">${L.foot}</p>
</div>`;
}

// 조용시간(HH:MM, 기본 Asia/Seoul). 자정 넘김(22:00~08:00) 처리.
function inQuietHours(now, quietStart, quietEnd, tz = 'Asia/Seoul') {
  const hm = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now);
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const cur = toMin(hm), s = toMin(quietStart), e = toMin(quietEnd);
  return s <= e ? (cur >= s && cur < e) : (cur >= s || cur < e);
}

async function run() {
  const now = new Date();
  const snap = await db.collection(COLLECTIONS.events).where('status', '==', 'scheduled').get();
  let sent = 0, skipped = 0, canceled = 0;

  for (const doc of snap.docs) {
    const ev = { id: doc.id, ...doc.data() };
    const dueMs = ev.scheduledAt?.toMillis ? ev.scheduledAt.toMillis() : 0;
    if (!dueMs || dueMs > now.getTime()) continue; // 미도래

    const dSnap = await db.collection(COLLECTIONS.decisions).doc(ev.decisionId).get();
    if (!dSnap.exists) { await doc.ref.update({ status: 'canceled' }); canceled++; continue; }
    const dec = dSnap.data();
    if (dec.status === 'closed') { await doc.ref.update({ status: 'canceled' }); canceled++; continue; }

    const uSnap = await db.collection(COLLECTIONS.users).doc(ev.uid).get();
    const st = uSnap.exists ? uSnap.data() : {};
    if (inQuietHours(now, st.quietStart || '22:00', st.quietEnd || '08:00')) { skipped++; continue; } // 조용시간 → 다음 틱으로 연기(scheduled 유지)
    const locale = st.locale || 'ko';

    // 동반 메시지(클라가 waymark.home.ask.{type}로 렌더) + 알림 + 이벤트 sent (멱등: status 가드)
    const msgRef = db.collection(COLLECTIONS.decisions).doc(ev.decisionId).collection(COLLECTIONS.decisionMessages).doc();
    const notiRef = db.collection(COLLECTIONS.notifications).doc();
    const batch = db.batch();
    batch.set(msgRef, { type: ev.type, tone: ev.tone || null, templateId: `ask.${ev.type}`, source: 'template', vars: { title: dec.title }, createdAt: FieldValue.serverTimestamp() });
    batch.set(notiRef, { uid: ev.uid, decisionId: ev.decisionId, type: ev.type, read: false, createdAt: FieldValue.serverTimestamp() });
    batch.update(doc.ref, { status: 'sent', sentAt: FieldValue.serverTimestamp() });
    await batch.commit();

    if (st.emailOptIn !== false) {
      try {
        const user = await auth.getUser(ev.uid);
        if (user.email) {
          const L = (EMAIL[locale] || EMAIL.ko)[ev.type];
          await sendEmail(user.email, L.subject, renderHtml(locale, ev.type, dec.title, `${APP_BASE}/d/${ev.decisionId}`));
        }
      } catch (e) { console.warn(`[waymark-nudge] email fail uid=${ev.uid}: ${e.message}`); }
    }
    sent++;
  }
  console.log(`[waymark-nudge] 완료: sent=${sent} skipped(quiet)=${skipped} canceled=${canceled} (총 scheduled ${snap.size})`);
}

run().then(() => process.exit(0)).catch((e) => { console.error('[waymark-nudge] fatal:', e); process.exit(1); });
