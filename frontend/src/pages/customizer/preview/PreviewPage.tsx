import { useEffect, useState } from 'react';
import { Button, Card, Empty, Spin, Tooltip, Typography, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { themeService } from '../../../services/themeService';
import { buttonBuilderService } from '../../../services/buttonBuilderService';
import { floatingButtonsService } from '../../../services/floatingButtonsService';
import { bookACallService } from '../../../services/bookACallService';
import { emptyTheme, Theme } from '../../../types/theme';
import { InjectedButton } from '../../../types/button';
import { FloatingButton } from '../../../types/floatingButton';
import { BookACallConfig, emptyBookACallConfig } from '../../../types/bookACall';

function gradientCss(theme: Theme, target: string, fallback: string): string {
  const gradient = theme.gradients.find((g) => g.target === target);
  if (!gradient) return fallback;
  return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`;
}

function colorRuleValue(theme: Theme, name: string, fallback: string): string {
  return theme.colorRules.find((rule) => rule.name === name)?.value ?? fallback;
}

export function PreviewPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [headerButtons, setHeaderButtons] = useState<InjectedButton[]>([]);
  const [floatingButtons, setFloatingButtons] = useState<FloatingButton[]>([]);
  const [bookACall, setBookACall] = useState<BookACallConfig>(emptyBookACallConfig);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      themeService.get(groupId),
      buttonBuilderService.list('header', groupId),
      floatingButtonsService.list(groupId),
      bookACallService.get(groupId),
    ])
      .then(([loadedTheme, loadedHeaderButtons, loadedFloatingButtons, loadedBookACall]) => {
        if (cancelled) return;
        setTheme(loadedTheme ?? emptyTheme);
        setHeaderButtons(loadedHeaderButtons);
        setFloatingButtons(loadedFloatingButtons);
        setBookACall(loadedBookACall ?? emptyBookACallConfig);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load preview data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const rightButtons = floatingButtons.filter((b) => b.position === 'right');
  const bottomButtons = floatingButtons.filter((b) => b.position === 'bottom');

  const headerBackground = gradientCss(theme, 'header', colorRuleValue(theme, 'Header Background', '#1e293b'));
  const sidebarBackground = gradientCss(theme, 'sidebar', colorRuleValue(theme, 'Sidebar Background', '#0f172a'));
  const primaryColor = colorRuleValue(theme, 'Primary Button', '#6366f1');
  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 6px 16px rgba(0,0,0,0.16)',
    lg: '0 14px 32px rgba(0,0,0,0.22)',
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<EyeOutlined />}
        description="A live combined preview of your theme, header buttons, floating buttons, and Book a Call — as they'll appear together in the embedded app."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Live preview">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: theme.borderRadius,
              boxShadow: shadowMap[theme.shadowIntensity] ?? shadowMap.md,
              border: '1px solid rgba(0,0,0,0.08)',
              fontFamily: theme.fonts.body,
              minHeight: 480,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: headerBackground,
                color: '#fff',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: theme.fonts.heading,
              }}
            >
              <Typography.Text style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
                {theme.themeName}
              </Typography.Text>
              <div className="flex gap-2">
                {headerButtons.length === 0 && (
                  <Typography.Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    No header buttons
                  </Typography.Text>
                )}
                {headerButtons.map((btn) => (
                  <Tooltip key={btn._id} title={btn.tooltip}>
                    <Button type={btn.style} size={btn.size}>
                      {btn.label}
                    </Button>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
              <div style={{ width: 160, background: sidebarBackground, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: 24, background: '#fafafa' }}>
                <Typography.Paragraph type="secondary">
                  Mock content area — reflects the fonts, border radius, and shadow from your
                  theme.
                </Typography.Paragraph>
                <Button
                  type="primary"
                  style={{ background: primaryColor, borderColor: primaryColor, borderRadius: theme.borderRadius }}
                >
                  Sample primary action
                </Button>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: 90,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-end',
              }}
            >
              {rightButtons.map((btn) => (
                <div
                  key={btn._id}
                  style={{
                    background: btn.backgroundColor,
                    color: btn.textColor,
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  }}
                >
                  {btn.label}
                </div>
              ))}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: bookACall.enabled ? 56 : 16,
                left: 16,
                display: 'flex',
                gap: 8,
              }}
            >
              {bottomButtons.map((btn) => (
                <div
                  key={btn._id}
                  style={{
                    background: btn.backgroundColor,
                    color: btn.textColor,
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  }}
                >
                  {btn.label}
                </div>
              ))}
            </div>

            {bookACall.enabled && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  background: bookACall.backgroundColor,
                  color: bookACall.textColor,
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {bookACall.buttonLabel}
              </div>
            )}

            {rightButtons.length === 0 &&
              bottomButtons.length === 0 &&
              !bookACall.enabled &&
              headerButtons.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <Empty
                    style={{ marginTop: 120 }}
                    description="No buttons configured yet — add some under Custom Buttons"
                  />
                </div>
              )}
          </div>
        )}
      </Card>
    </div>
  );
}
