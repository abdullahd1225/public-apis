import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    setError();
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setError(e.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44 }}>📚</div>
          <Typography.Title level={3} style={{ margin: 0 }}>Okul Takip Paneli</Typography.Title>
          <Typography.Text type="secondary">Ödev ve ders takip sistemi</Typography.Text>
        </div>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'E-posta girin' }]}>
            <Input prefix={<MailOutlined />} placeholder="E-posta" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Şifre girin' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Şifre" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Giriş Yap</Button>
        </Form>
      </Card>
    </div>
  );
}
