import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Input, InputNumber, Popconfirm, Row, Select, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, MessageOutlined } from '@ant-design/icons';
import { feedbackService } from '../../../services/feedbackService';
import { FeedbackFilters, FeedbackKind, FeedbackResponse, FeedbackStats } from '../../../types/feedback';

const PAGE_SIZE = 25;
const KIND_LABELS: Record<FeedbackKind, string> = { rating: 'Button', chat: 'Chat', cancellation: 'Cancellation' };
const KIND_COLORS: Record<FeedbackKind, string> = { rating: 'blue', chat: 'green', cancellation: 'red' };

function Bars({ values, labels, color }: { values: number[]; labels: string[]; color: string }) {
  const max = Math.max(1, ...values);
  return (
    <div>
      {values.map((v, i) => (
        <div key={labels[i]} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 150, fontSize: 12, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels[i]}</span>
          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 14 }}>
            <div style={{ width: `${(v / max) * 100}%`, background: color, height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ width: 28, fontSize: 12 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DayChart({ days }: { days: FeedbackStats['byDay'] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
      {days.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          style={{ flex: 1, height: `${Math.max(d.count ? 6 : 2, (d.count / max) * 100)}%`, background: d.count ? '#4f46e5' : '#e5e7eb', borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

function ratingText(r: FeedbackResponse): string {
  if (r.rating === null) return '—';
  return r.ratingType === 'ten' ? `${r.rating}/10` : `${r.rating}/5`;
}

export function FeedbackResponsesPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [rows, setRows] = useState<FeedbackResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FeedbackFilters>({ kind: 'all' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([feedbackService.listResponses(filters, page, PAGE_SIZE), feedbackService.stats()]);
      setRows(list.responses);
      setTotal(list.total);
      setStats(s);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (p: Partial<FeedbackFilters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...p }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await feedbackService.exportCsv(filters);
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedback.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await feedbackService.removeResponse(id);
      message.success('Response deleted');
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        <MessageOutlined /> Feedback Responses
      </Typography.Title>
      {stats ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Card size="small"><Statistic title="Responses" value={stats.total} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small"><Statistic title="Average rating (of 5)" value={stats.rating.average ?? '—'} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small"><Statistic title="Chat rating (of 5)" value={stats.chat.average ?? '—'} suffix={stats.chat.count ? `(${stats.chat.count})` : ''} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small"><Statistic title="Cancellations" value={stats.cancellation.count} /></Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Card size="small" title="Rating spread">
                <Bars values={[...stats.rating.distribution].reverse()} labels={['5 ★', '4 ★', '3 ★', '2 ★', '1 ★']} color="#f59e0b" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="Why people cancel">
                {stats.cancellation.reasons.length ? (
                  <Bars values={stats.cancellation.reasons.map((r) => r.count)} labels={stats.cancellation.reasons.map((r) => r.reason)} color="#ef4444" />
                ) : (
                  <Typography.Text type="secondary">No cancellations recorded.</Typography.Text>
                )}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" title="Last 30 days">
                <DayChart days={stats.byDay} />
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
      <Space wrap style={{ marginBottom: 12 }}>
        <Select
          style={{ width: 150 }}
          value={filters.kind}
          onChange={(kind) => patch({ kind })}
          options={[{ value: 'all', label: 'All types' }, { value: 'rating', label: 'Button' }, { value: 'chat', label: 'Chat' }, { value: 'cancellation', label: 'Cancellation' }]}
        />
        <InputNumber min={1} max={5} placeholder="Min ★" value={filters.minRating} onChange={(v) => patch({ minRating: v ?? undefined })} />
        <InputNumber min={1} max={5} placeholder="Max ★" value={filters.maxRating} onChange={(v) => patch({ maxRating: v ?? undefined })} />
        <DatePicker.RangePicker
          onChange={(range) => patch({ from: range?.[0]?.startOf('day').toISOString(), to: range?.[1]?.endOf('day').toISOString() })}
        />
        <Input.Search
          allowClear
          style={{ width: 240 }}
          placeholder="Search comments, names, emails"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value) patch({ search: undefined });
          }}
          onSearch={(v) => patch({ search: v.trim() || undefined })}
        />
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={() => void handleExport()}>
          Export CSV
        </Button>
      </Space>
      <Table<FeedbackResponse>
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={{ current: page, pageSize: PAGE_SIZE, total, showSizeChanger: false, onChange: setPage }}
        locale={{ emptyText: 'No feedback yet.' }}
        columns={[
          { title: 'When', dataIndex: 'createdAt', width: 170, render: (d: string) => new Date(d).toLocaleString() },
          { title: 'Type', dataIndex: 'kind', width: 120, render: (k: FeedbackKind) => <Tag color={KIND_COLORS[k]}>{KIND_LABELS[k]}</Tag> },
          { title: 'Rating', key: 'rating', width: 80, render: (_: unknown, r) => ratingText(r) },
          {
            title: 'Feedback',
            key: 'comment',
            render: (_: unknown, r) => (
              <div>
                {r.reasons.map((x) => <Tag key={x}>{x}</Tag>)}
                {r.comment ? <div style={{ whiteSpace: 'pre-wrap' }}>{r.comment}</div> : null}
              </div>
            ),
          },
          {
            title: 'From',
            key: 'from',
            width: 210,
            render: (_: unknown, r) => (
              <div style={{ fontSize: 12 }}>
                <div>{r.userName || '—'}</div>
                <div style={{ color: '#6b7280' }}>{r.userEmail}</div>
              </div>
            ),
          },
          {
            title: '',
            key: 'actions',
            width: 60,
            render: (_: unknown, r) => (
              <Popconfirm title="Delete this response?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => void handleDelete(r.id)}>
                <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete" />
              </Popconfirm>
            ),
          },
        ]}
      />
    </div>
  );
}
