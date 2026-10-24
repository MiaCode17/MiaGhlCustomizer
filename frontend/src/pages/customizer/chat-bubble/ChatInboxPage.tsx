import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Empty, Input, List, Popconfirm, Segmented, Space, Spin, Tag, Typography, message } from 'antd';
import { CustomerServiceOutlined, DeleteOutlined } from '@ant-design/icons';
import { chatBubbleService } from '../../../services/chatBubbleService';
import { supportChatService } from '../../../services/supportChatService';
import { SupportMessage, SupportTicket } from '../../../types/supportChat';

type StatusFilter = 'open' | 'closed' | 'all';

const LIST_POLL_MS = 8000;
const DETAIL_POLL_MS = 4000;
const TYPING_PING_MS = 4000;

function when(iso: string | number): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function who(t: Pick<SupportTicket, 'visitorName' | 'visitorEmail'>): string {
  return t.visitorName || t.visitorEmail || 'Visitor';
}

/** The agency's inbox for chats started from the chat bubble in GHL. */
export function ChatInboxPage() {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [agentName, setAgentName] = useState('Support');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastTypingPing = useRef(0);
  const stickToBottom = useRef(true);

  const loadList = useCallback(
    (showSpinner = false) => {
      if (showSpinner) setListLoading(true);
      return supportChatService
        .list({ status, search, limit: 50 })
        .then((res) => {
          setTickets(res.tickets);
          setTotal(res.total);
        })
        .catch(() => {
          if (showSpinner) message.error('Failed to load chats');
        })
        .finally(() => setListLoading(false));
    },
    [status, search],
  );

  // The list reloads when the filters change (search is debounced) and then polls.
  useEffect(() => {
    const t = setTimeout(() => void loadList(true), search ? 250 : 0);
    return () => clearTimeout(t);
  }, [loadList, search]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) void loadList(false);
    }, LIST_POLL_MS);
    return () => clearInterval(id);
  }, [loadList]);

  useEffect(() => {
    chatBubbleService
      .get()
      .then((c) => c?.agentName && setAgentName(c.agentName))
      .catch(() => undefined);
  }, []);

  const loadDetail = useCallback((id: string, showSpinner: boolean) => {
    if (showSpinner) setDetailLoading(true);
    return supportChatService
      .get(id)
      .then((res) => {
        setTicket(res.ticket);
        setMessages(res.messages);
      })
      .catch((err) => {
        if (showSpinner) message.error(err instanceof Error ? err.message : 'Failed to open the chat');
      })
      .finally(() => setDetailLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return undefined;
    stickToBottom.current = true;
    void loadDetail(selectedId, true).then(() => loadList(false));
    const id = setInterval(() => {
      if (!document.hidden) void loadDetail(selectedId, false);
    }, DETAIL_POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep the newest message in view unless the agent scrolled up to read.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, selectedId]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleDraft = (value: string) => {
    setDraft(value);
    const now = Date.now();
    if (selectedId && value.trim() && ticket?.status === 'open' && now - lastTypingPing.current > TYPING_PING_MS) {
      lastTypingPing.current = now;
      void supportChatService.typing(selectedId).catch(() => undefined);
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      const sent = await supportChatService.reply(selectedId, text, agentName);
      setDraft('');
      lastTypingPing.current = 0;
      stickToBottom.current = true;
      setMessages((m) => [...m, sent]);
      void loadList(false);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to send the reply');
    } finally {
      setSending(false);
    }
  };

  const act = async (fn: () => Promise<void>, done: string) => {
    if (!selectedId) return;
    try {
      await fn();
      message.success(done);
      await Promise.all([loadDetail(selectedId, false), loadList(false)]);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'That did not work');
    }
  };

  const remove = async () => {
    if (!selectedId) return;
    try {
      await supportChatService.remove(selectedId);
      message.success('Chat deleted');
      setSelectedId(null);
      setTicket(null);
      setMessages([]);
      void loadList(false);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete the chat');
    }
  };

  const bubble = (m: SupportMessage) => {
    if (m.sender === 'system') {
      return (
        <div key={m.id} style={{ alignSelf: 'center', fontSize: 12, color: '#6b7280', padding: '2px 8px' }}>
          {m.text} · {when(m.at)}
        </div>
      );
    }
    const mine = m.sender === 'agent';
    return (
      <div
        key={m.id}
        style={{
          alignSelf: mine ? 'flex-end' : 'flex-start',
          maxWidth: '75%',
          padding: '8px 12px',
          borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: mine ? '#4f46e5' : '#f3f4f6',
          color: mine ? '#fff' : '#111827',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
          {mine ? m.authorName || 'Support' : who(ticket ?? { visitorName: '', visitorEmail: '' })} · {when(m.at)}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-4">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <CustomerServiceOutlined style={{ fontSize: 22 }} />
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Chat Inbox
          </Typography.Title>
          <Typography.Text type="secondary">Conversations started from the chat bubble in your sub-accounts.</Typography.Text>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 16, height: 'calc(100vh - 220px)', minHeight: 440 }}>
        <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6' }}>
            <Segmented
              block
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'all', label: 'All' },
              ]}
            />
            <Input.Search
              allowClear
              placeholder="Search name, email, message or location"
              style={{ marginTop: 10 }}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <List
              loading={listLoading}
              dataSource={tickets}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={search ? 'No chats match' : 'No chats yet'} /> }}
              renderItem={(t) => (
                <List.Item
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{ cursor: 'pointer', padding: '10px 14px', background: t.id === selectedId ? '#eef2ff' : undefined }}
                >
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <Typography.Text strong ellipsis>
                        {who(t)}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
                        {when(t.lastMessageAt)}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <Typography.Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                        {t.lastMessageFrom === 'agent' ? 'You: ' : ''}
                        {t.lastMessagePreview}
                      </Typography.Text>
                      <Space size={4} style={{ flexShrink: 0 }}>
                        {t.status === 'closed' && <Tag style={{ marginInlineEnd: 0 }}>Closed</Tag>}
                        {t.unreadForAgent > 0 && <Badge count={t.unreadForAgent} />}
                      </Space>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
          <div style={{ padding: '6px 14px', borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#6b7280' }}>
            {total} chat{total === 1 ? '' : 's'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {!selectedId || !ticket ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {detailLoading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a chat to read and reply" />}
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Typography.Text strong style={{ fontSize: 15 }}>
                    {who(ticket)}
                  </Typography.Text>{' '}
                  <Tag color={ticket.status === 'open' ? 'green' : 'default'}>{ticket.status === 'open' ? 'Open' : 'Closed'}</Tag>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {ticket.visitorEmail ? `${ticket.visitorEmail} · ` : ''}Location {ticket.locationId} · started {when(ticket.createdAt)}
                  </div>
                </div>
                <Space>
                  {ticket.status === 'open' ? (
                    <Button onClick={() => act(() => supportChatService.close(ticket.id), 'Chat closed')}>Close chat</Button>
                  ) : (
                    <Button onClick={() => act(() => supportChatService.reopen(ticket.id), 'Chat reopened')}>Reopen</Button>
                  )}
                  <Popconfirm title="Delete this chat and all its messages?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={remove}>
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>

              <div ref={scrollRef} onScroll={onScroll} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map(bubble)}
              </div>

              <div style={{ padding: 12, borderTop: '1px solid #f3f4f6' }}>
                {ticket.status === 'open' ? (
                  <Space.Compact style={{ width: '100%' }}>
                    <Input.TextArea
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      placeholder={`Reply as ${agentName}…  (Enter to send, Shift+Enter for a new line)`}
                      value={draft}
                      maxLength={2000}
                      onChange={(e) => handleDraft(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          void send();
                        }
                      }}
                    />
                    <Button type="primary" loading={sending} disabled={!draft.trim()} onClick={() => void send()} style={{ height: 'auto' }}>
                      Send
                    </Button>
                  </Space.Compact>
                ) : (
                  <Typography.Text type="secondary">This chat is closed. Reopen it to reply.</Typography.Text>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
