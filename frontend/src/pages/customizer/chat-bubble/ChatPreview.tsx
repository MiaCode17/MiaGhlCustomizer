import { IconGlyph } from '../../../components/IconPicker';
import { ChatBubbleConfig } from '../../../types/chatBubble';

/** A static picture of the chat window using the colors and copy being edited (approximate). */
export function ChatPreview({ config }: { config: ChatBubbleConfig }) {
  const c = config;
  const headerBg = c.headerBgColor || `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`;
  const tabs = [
    { label: c.chatEnabled ? 'Chat' : 'Home', icon: c.chatEnabled ? 'chat' : 'home' },
    ...c.navTabs.filter((t) => t.enabled && t.label).map((t) => ({ label: t.label, icon: t.icon ?? '' })),
  ];
  const showTabs = !c.hideNavTabs && tabs.length > 1;
  const showInput = c.chatEnabled && !c.hideInput;

  const bubble = (mine: boolean, text: string, name?: string) => (
    <div
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        padding: '8px 12px',
        background: mine ? c.visitorBubbleBg : c.agentBubbleBg,
        color: mine ? c.visitorBubbleText : c.agentBubbleText,
        borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: 13.5,
        lineHeight: 1.4,
      }}
    >
      {!mine && name ? <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, marginBottom: 2 }}>{name}</div> : null}
      {text}
    </div>
  );

  return (
    <div>
      <div
        style={{
          width: Math.min(c.windowWidth, 380),
          height: Math.min(Math.round((c.windowHeight / c.windowWidth) * Math.min(c.windowWidth, 380)), 560),
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,.22)',
          font: '14px/1.45 system-ui, -apple-system, sans-serif',
          color: '#111827',
        }}
      >
        <div style={{ background: headerBg, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,.2)' }} />
          ) : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.headerTitleColor }}>{c.title || 'Chat with us'}</div>
            {c.subtitle ? <div style={{ fontSize: 12.5, color: c.headerSubtitleColor }}>{c.subtitle}</div> : null}
            {c.showStatus && c.statusText ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.headerSubtitleColor, marginTop: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.statusColor, display: 'inline-block' }} />
                {c.statusText}
              </div>
            ) : null}
          </div>
          <span style={{ color: c.headerTitleColor, fontSize: 16 }}>✕</span>
        </div>

        {showTabs && (
          <div style={{ display: 'flex', gap: 4, padding: 6, background: c.navBarBgColor, borderBottom: `1px solid ${c.navBarBorderColor}`, flexShrink: 0 }}>
            {tabs.map((tab, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 6px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: i === 0 ? c.navTabActiveBgColor : 'transparent',
                  color: i === 0 ? c.navTabActiveColor : c.navTabInactiveColor,
                }}
              >
                <IconGlyph value={tab.icon} size={14} />
                {tab.label}
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          {c.welcomeMessage ? bubble(false, c.welcomeMessage, c.agentName) : null}
          {c.chatEnabled && c.quickReplies.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.quickReplies.map((q) => (
                <span
                  key={q}
                  style={{ padding: '6px 12px', borderRadius: 999, background: c.visitorBubbleBg, color: c.visitorBubbleText, border: `1px solid ${c.visitorBubbleBg}`, fontSize: 13 }}
                >
                  {q}
                </span>
              ))}
            </div>
          )}
          {c.quickActions.map((a) => (
            <div key={a.label} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, color: c.visitorBubbleBg, fontWeight: 600, fontSize: 14 }}>
              {a.label}
            </div>
          ))}
          {c.chatEnabled && (
            <>
              {bubble(true, 'Hi! Do you have a minute?')}
              {bubble(false, 'Of course, how can I help?', c.agentName)}
            </>
          )}
        </div>

        {showInput && (
          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #e5e7eb', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 10, padding: '9px 11px', color: '#9ca3af', fontSize: 14 }}>
              {c.inputPlaceholder}
            </div>
            {!c.hideSendButton && (
              <div style={{ background: c.visitorBubbleBg, color: c.visitorBubbleText, borderRadius: 10, padding: '9px 14px', fontWeight: 600, fontSize: 14 }}>Send</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: c.side === 'left' ? 'flex-start' : 'flex-end', marginTop: 14, padding: '0 8px' }}>
        <span
          style={{
            width: c.bubbleSize,
            height: c.bubbleSize,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`,
            color: c.bubbleTextColor,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(0,0,0,.25)',
          }}
        >
          <IconGlyph value={c.bubbleIcon || 'chat'} size={Math.round(c.bubbleSize * 0.46)} />
        </span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', marginTop: 8 }}>Live preview (approximate)</div>
    </div>
  );
}
