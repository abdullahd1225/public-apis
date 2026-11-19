import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Space, Typography, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { studentsApi } from '../api/client.js';
import ClassroomSelect from '../components/ClassroomSelect.jsx';

export default function StudentsPage() {
  const { message } = App.useApp();
  const [classroom, setClassroom] = useState();
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => { setLoading(true); studentsApi.list({ classroom, q: q || undefined }).then(setList).finally(() => setLoading(false)); };
  useEffect(load, [classroom, q]);

  const open = (s) => { setEditing(s || {}); form.setFieldsValue(s ? { ...s, classroom: s.classroom?._id } : { classroom }); };
  const save = async () => {
    const v = await form.validateFields();
    try {
      editing._id ? await studentsApi.update(editing._id, v) : await studentsApi.create(v);
      message.success('Kaydedildi'); setEditing(null); load();
    } catch (e) { message.error(e.userMessage); }
  };
  const remove = async (s) => { await studentsApi.remove(s._id); message.success('Öğrenci pasifleştirildi'); load(); };

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} className="page-title" style={{ margin: 0 }}>Öğrenciler</Typography.Title>
        <Space wrap>
          <ClassroomSelect value={classroom} onChange={setClassroom} allowClear />
          <Input.Search placeholder="Ad, soyad, no..." allowClear onSearch={setQ} style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open()}>Yeni Öğrenci</Button>
        </Space>
      </Space>
      <Table rowKey="_id" loading={loading} dataSource={list} scroll={{ x: 800 }}
        columns={[
          { title: 'No', dataIndex: 'studentNo', width: 70 },
          { title: 'Ad Soyad', render: (_, s) => <Link to={`/students/${s._id}`}>{s.firstName} {s.lastName}</Link> },
          { title: 'Sınıf', render: (_, s) => s.classroom?.name },
          { title: 'Veli', dataIndex: 'parentName' },
          { title: 'Veli Telefon', dataIndex: 'parentPhone', render: (p) => p && <a href={`tel:${p}`}><PhoneOutlined /> {p}</a> },
          { title: 'Veli E-posta', dataIndex: 'parentEmail', render: (m) => m && <a href={`mailto:${m}`}><MailOutlined /> {m}</a> },
          {
            title: '', width: 100, render: (_, s) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => open(s)} />
                <Popconfirm title="Öğrenci pasifleştirilsin mi? (geçmiş kayıtlar korunur)" onConfirm={() => remove(s)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
              </Space>
            ),
          },
        ]} />
      <Modal title={editing?._id ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'} open={!!editing} onOk={save} onCancel={() => setEditing(null)} okText="Kaydet" cancelText="Vazgeç" destroyOnClose>
        <Form form={form} layout="vertical">
          <Space.Compact block>
            <Form.Item name="firstName" label="Ad" rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="lastName" label="Soyad" rules={[{ required: true }]} style={{ flex: 1, marginLeft: 8 }}><Input /></Form.Item>
          </Space.Compact>
          <Form.Item name="studentNo" label="Öğrenci No"><Input /></Form.Item>
          <Form.Item name="classroom" label="Sınıf" rules={[{ required: true }]}><ClassroomSelect /></Form.Item>
          <Form.Item name="parentName" label="Veli Adı Soyadı"><Input /></Form.Item>
          <Form.Item name="parentPhone" label="Veli Telefon"><Input placeholder="05xx xxx xx xx" /></Form.Item>
          <Form.Item name="parentEmail" label="Veli E-posta" rules={[{ type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="notes" label="Notlar"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
