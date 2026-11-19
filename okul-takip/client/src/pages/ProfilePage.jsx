import { Card, Form, Input, Button, Typography, App } from 'antd';
import { api } from '../api/client.js';

export default function ProfilePage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const onFinish = async (v) => {
    try {
      await api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
      message.success('Şifreniz değiştirildi');
      form.resetFields();
    } catch (e) { message.error(e.userMessage); }
  };
  return (
    <Card style={{ maxWidth: 420 }}>
      <Typography.Title level={4}>Şifre Değiştir</Typography.Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="currentPassword" label="Mevcut Şifre" rules={[{ required: true }]}><Input.Password /></Form.Item>
        <Form.Item name="newPassword" label="Yeni Şifre" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
        <Form.Item name="confirm" label="Yeni Şifre (tekrar)" dependencies={['newPassword']}
          rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, v) => (v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('Şifreler eşleşmiyor'))) })]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">Kaydet</Button>
      </Form>
    </Card>
  );
}
