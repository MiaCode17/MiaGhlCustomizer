import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ width: 380, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ marginBottom: 4, color: '#7a1f2b' }}>
          Mia GHL Customizer
        </Typography.Title>
        <Typography.Text type="secondary">Sign in to manage your agency's customizations</Typography.Text>
      </div>
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@agency.com" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
