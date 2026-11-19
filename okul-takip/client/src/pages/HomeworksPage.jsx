import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Typography, App, Popconfirm, Drawer, Radio, Progress, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckSquareOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { homeworksApi } from '../api/client.js';
import ClassroomSelect from '../components/ClassroomSelect.jsx';

export default function HomeworksPage() {
  const { message } = App.useApp();
  const [classrooms, setClassrooms] = useState([]);
  const [classroom, setClassroom] = useState();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [checking, setChecking] = useState(null);
  const [form] = Form.useForm();
  const formClassroom = Form.useWatch('classroom', form);

  const load = () => { setLoading(true); homeworksApi.list({ classroom }).then(setList).finally(() => setLoading(false)); };
  useEffect(load, [classroom]);

  const subjectsOf = (id) => classrooms.find((c) => c._id === id)?.subjects || [];
  const open = (h) => {
    setEditing(h || {});
    form.setFieldsValue(h ? { ...h, classroom: h.classroom?._id, assignedDate: dayjs(h.assignedDate), dueDate: dayjs(h.dueDate) } : { classroom, assignedDate: dayjs(), dueDate: dayjs().add(7, 'day') });
  };
  const save = async () => {
    const v = await form.validateFields();
    const data = { ...v, assignedDate: v.assignedDate?.toISOString(), dueDate: v.dueDate.toISOString() };
    try {
      editing._id ? await homeworksApi.update(editing._id, data) : await homeworksApi.create(data);
      message.success('Kaydedildi'); setEditing(null); load();
    } catch (e) { message.error(e.userMessage); }
  };
  const remove = async (h) => { await homeworksApi.remove(h._id); load(); };

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} className="page-title" style={{ margin: 0 }}>Ödevler</Typography.Title>
        <Space wrap>
          <ClassroomSelect value={classroom} onChange={setClassroom} allowClear onLoaded={setClassrooms} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open()}>Yeni Ödev</Button>
        </Space>
      </Space>
      <Table rowKey="_id" loading={loading} dataSource={list} scroll={{ x: 800 }}
        columns={[
          { title: 'Ödev', dataIndex: 'title' },
          { title: 'Sınıf', render: (_, h) => h.classroom?.name, width: 80 },
          { title: 'Ders', dataIndex: 'subject' },
          { title: 'Teslim', dataIndex: 'dueDate', render: (d) => dayjs(d).format('DD.MM.YYYY'), sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate) },
          {
            title: 'Kontrol Durumu', width: 220, render: (_, h) => {
              const s = h.summary; const n = s.studentCount || 1;
              return (
                <Tooltip title={`Yaptı ${s.done} · Eksik ${s.partial} · Yapmadı ${s.not_done} · Bekleyen ${Math.max(s.studentCount - s.checked, 0)}`}>
                  <Progress percent={Math.round((s.checked / n) * 100)} success={{ percent: Math.round((s.done / n) * 100) }} size="small" format={() => `${s.checked}/${s.studentCount}`} />
                </Tooltip>
              );
            },
          },
          {
            title: '', width: 150, render: (_, h) => (
              <Space>
                <Button size="small" type="primary" icon={<CheckSquareOutlined />} onClick={() => setChecking(h)}>Kontrol</Button>
                <Button size="small" icon={<EditOutlined />} onClick={() => open(h)} />
                <Popconfirm title="Ödev ve kontrol kayıtları silinsin mi?" onConfirm={() => remove(h)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
              </Space>
            ),
          },
        ]} />
      <Modal title={editing?._id ? 'Ödev Düzenle' : 'Yeni Ödev'} open={!!editing} onOk={save} onCancel={() => setEditing(null)} okText="Kaydet" cancelText="Vazgeç" destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="classroom" label="Sınıf" rules={[{ required: true }]}><ClassroomSelect /></Form.Item>
          <Form.Item name="subject" label="Ders"><Select allowClear options={subjectsOf(formClassroom).map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item name="title" label="Başlık" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Açıklama"><Input.TextArea rows={3} /></Form.Item>
          <Space>
            <Form.Item name="assignedDate" label="Veriliş Tarihi"><DatePicker format="DD.MM.YYYY" /></Form.Item>
            <Form.Item name="dueDate" label="Teslim Tarihi" rules={[{ required: true }]}><DatePicker format="DD.MM.YYYY" /></Form.Item>
          </Space>
        </Form>
      </Modal>
      <CheckDrawer homework={checking} onClose={(changed) => { setChecking(null); if (changed) load(); }} />
    </>
  );
}

/** Ödev kontrol çekmecesi: öğrenci başına Yaptı / Eksik / Yapmadı */
function CheckDrawer({ homework, onClose }) {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (homework) homeworksApi.checks(homework._id).then(setRows); else setRows([]); }, [homework]);

  const setRow = (id, patch) => setRows((rs) => rs.map((r) => (r.student._id === id ? { ...r, ...patch } : r)));
  const markAll = (status) => setRows((rs) => rs.map((r) => ({ ...r, status })));
  const save = async () => {
    setSaving(true);
    try {
      await homeworksApi.saveChecks(homework._id, rows.map((r) => ({ student: r.student._id, status: r.status, note: r.note })));
      message.success('Kontroller kaydedildi');
      onClose(true);
    } catch (e) { message.error(e.userMessage); } finally { setSaving(false); }
  };

  return (
    <Drawer title={homework ? `Ödev Kontrolü: ${homework.title}` : ''} open={!!homework} onClose={() => onClose(false)} width={Math.min(720, window.innerWidth)}
      extra={<Button type="primary" loading={saving} onClick={save}>Kaydet</Button>}>
      <Space style={{ marginBottom: 12 }} wrap>
        <span>Tümünü işaretle:</span>
        <Button size="small" onClick={() => markAll('done')}>Yaptı</Button>
        <Button size="small" onClick={() => markAll('not_done')}>Yapmadı</Button>
        <Button size="small" onClick={() => markAll(null)}>Temizle</Button>
      </Space>
      <Table rowKey={(r) => r.student._id} dataSource={rows} pagination={false} size="small" scroll={{ x: 560 }}
        columns={[
          { title: 'Öğrenci', render: (_, r) => `${r.student.studentNo ? r.student.studentNo + ' - ' : ''}${r.student.firstName} ${r.student.lastName}` },
          {
            title: 'Durum', width: 250, render: (_, r) => (
              <Radio.Group size="small" optionType="button" buttonStyle="solid" value={r.status} onChange={(e) => setRow(r.student._id, { status: e.target.value })}
                options={[{ value: 'done', label: 'Yaptı' }, { value: 'partial', label: 'Eksik' }, { value: 'not_done', label: 'Yapmadı' }]} />
            ),
          },
          { title: 'Not', render: (_, r) => <Input size="small" value={r.note} onChange={(e) => setRow(r.student._id, { note: e.target.value })} /> },
        ]} />
    </Drawer>
  );
}
