import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Typography, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usersApi } from '../api/client.js';

export default function UsersPage() {
  const { message } = App.useApp();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // null: kapalı, {}: yeni
  const [form] = Form.useForm();

  const load = () => { setLoading(true); usersApi.list().then(setList).finally(() => setLoading(false)); };
  useEffect(load, []);

  const open = (u) => { setEditing(u || {}); form.setFieldsValue(u ? { ...u, password: '' } : { role: 'teacher', active: true }); };
  const save = async () => {
    const v = await form.validateFields();
    if (!v.password) delete v.password;
    try {
      editing._id ? await usersApi.update(editing._id, v) : await usersApi.create(v);
      message.success('Kaydedildi');
      setEditing(null);
      load();
    } catch (e) { message.error(e.userMessage); }
  };
  const deactivate = async (u) => {
    try { await usersApi.remove(u._id); message.success('Kullanıcı pasifleştirildi'); load(); } catch (e) { message.error(e.userMessage); }
  };

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} className="page-title" style={{ margin: 0 }}>Kullanıcılar</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => open()}>Yeni Kullanıcı</Button>
      </Space>
      <Table rowKey="_id" loading={loading} dataSource={list} scroll={{ x: 700 }}
        columns={[
          { title: 'Ad Soyad', dataIndex: 'name' },
          { title: 'E-posta', dataIndex: 'email' },
          { title: 'Branş', dataIndex: 'branch' },
          { title: 'Rol', dataIndex: 'role', render: (r) => <Tag color={r === 'admin' ? 'purple' : 'blue'}>{r === 'admin' ? 'Yönetici' : 'Öğretmen'}</Tag> },
          { title: 'Durum', dataIndex: 'active', render: (a) => <Tag color={a ? 'green' : 'default'}>{a ? 'Aktif' : 'Pasif'}</Tag> },
          { title: 'Son Giriş', dataIndex: 'lastLoginAt', render: (d) => (d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '-') },
          {
            title: '', width: 100, render: (_, u) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => open(u)} />
                {u.active && <Popconfirm title="Kullanıcı pasifleştirilsin mi?" onConfirm={() => deactivate(u)}><Button size="small" danger icon={<StopOutlined />} /></Popconfirm>}
              </Space>
            ),
          },
        ]} />
      <Modal title={editing?._id ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'} open={!!editing} onOk={save} onCancel={() => setEditing(null)} okText="Kaydet" cancelText="Vazgeç" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, min: 2 }]}><Input /></Form.Item>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="password" label={editing?._id ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre'} rules={[{ required: !editing?._id, min: 6 }]}><Input.Password /></Form.Item>
          <Form.Item name="branch" label="Branş"><Input placeholder="Örn: Matematik" /></Form.Item>
          <Form.Item name="phone" label="Telefon"><Input /></Form.Item>
          <Form.Item name="role" label="Rol"><Select options={[{ value: 'teacher', label: 'Öğretmen' }, { value: 'admin', label: 'Yönetici' }]} /></Form.Item>
          <Form.Item name="active" label="Aktif" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
