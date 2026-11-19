import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Typography, App, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { classroomsApi, usersApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const currentYear = () => { const d = new Date(); const y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; return `${y}-${y + 1}`; };

export default function ClassroomsPage() {
  const { isAdmin } = useAuth();
  const { message } = App.useApp();
  const [list, setList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => classroomsApi.list().then(setList);
  useEffect(() => { load(); if (isAdmin) usersApi.list().then((u) => setTeachers(u.filter((x) => x.active))); }, []);

  const open = (c) => {
    setEditing(c || {});
    form.setFieldsValue(c ? { ...c, teacher: c.teacher?._id } : { academicYear: currentYear(), subjects: [], weeklyLessonHours: 30 });
  };
  const save = async () => {
    const v = await form.validateFields();
    try {
      editing._id ? await classroomsApi.update(editing._id, v) : await classroomsApi.create(v);
      message.success('Kaydedildi'); setEditing(null); load();
    } catch (e) { message.error(e.userMessage); }
  };
  const remove = async (c) => { try { await classroomsApi.remove(c._id); load(); } catch (e) { message.error(e.userMessage); } };

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} className="page-title" style={{ margin: 0 }}>Sınıflar</Typography.Title>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => open()}>Yeni Sınıf</Button>}
      </Space>
      <Table rowKey="_id" dataSource={list} scroll={{ x: 700 }}
        columns={[
          { title: 'Sınıf', dataIndex: 'name' },
          { title: 'Öğretim Yılı', dataIndex: 'academicYear' },
          { title: 'Öğretmen', render: (_, c) => c.teacher?.name },
          { title: 'Öğrenci', dataIndex: 'studentCount' },
          { title: 'Dersler', dataIndex: 'subjects', render: (s) => s?.map((x) => <Tag key={x}>{x}</Tag>) },
          { title: 'Haftalık Saat', dataIndex: 'weeklyLessonHours' },
          {
            title: '', width: 100, render: (_, c) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => open(c)} />
                {isAdmin && <Popconfirm title="Sınıf silinsin mi?" onConfirm={() => remove(c)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>}
              </Space>
            ),
          },
        ]} />
      <Modal title={editing?._id ? 'Sınıf Düzenle' : 'Yeni Sınıf'} open={!!editing} onOk={save} onCancel={() => setEditing(null)} okText="Kaydet" cancelText="Vazgeç" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Sınıf Adı" rules={[{ required: true }]}><Input placeholder="Örn: 4-A" disabled={!isAdmin} /></Form.Item>
          <Form.Item name="academicYear" label="Öğretim Yılı" rules={[{ required: true }]}><Input placeholder="2026-2027" disabled={!isAdmin} /></Form.Item>
          {isAdmin && (
            <Form.Item name="teacher" label="Sorumlu Öğretmen" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={teachers.map((t) => ({ value: t._id, label: `${t.name}${t.role === 'admin' ? ' (yönetici)' : ''}` }))} />
            </Form.Item>
          )}
          <Form.Item name="subjects" label="Takip Edilen Dersler"><Select mode="tags" placeholder="Ders adı yazıp Enter'a basın" /></Form.Item>
          <Form.Item name="weeklyLessonHours" label="Haftalık Ders Saati"><InputNumber min={0} max={60} /></Form.Item>
          <Form.Item name="description" label="Açıklama"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
