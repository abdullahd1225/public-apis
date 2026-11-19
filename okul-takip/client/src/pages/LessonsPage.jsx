import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Space, Typography, App, Tag, Row, Col, Empty, Popconfirm, Statistic } from 'antd';
import { PlusOutlined, LeftOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { lessonsApi, studentsApi } from '../api/client.js';
import { LESSON_STATUS } from '../theme.js';
import ClassroomSelect from '../components/ClassroomSelect.jsx';

const monday = (d) => dayjs(d).subtract((dayjs(d).day() + 6) % 7, 'day').startOf('day');
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

export default function LessonsPage() {
  const { message } = App.useApp();
  const [classrooms, setClassrooms] = useState([]);
  const [classroom, setClassroom] = useState();
  const [week, setWeek] = useState(monday(new Date()));
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = () => classroom && lessonsApi.list({ classroom, week: week.format('YYYY-MM-DD') }).then(setLessons);
  useEffect(() => { load(); }, [classroom, week]);
  useEffect(() => { if (classroom) studentsApi.list({ classroom }).then(setStudents); }, [classroom]);

  const cls = classrooms.find((c) => c._id === classroom);
  const open = (l, date) => {
    setEditing(l || {});
    form.setFieldsValue(l ? { ...l, date: dayjs(l.date) } : { date: date || week, hours: 1, status: 'planned', absentStudents: [] });
  };
  const save = async () => {
    const v = await form.validateFields();
    const data = { ...v, date: v.date.format('YYYY-MM-DD'), classroom };
    try {
      editing._id ? await lessonsApi.update(editing._id, data) : await lessonsApi.create(data);
      message.success('Kaydedildi'); setEditing(null); load();
    } catch (e) { message.error(e.userMessage); }
  };
  const remove = async () => { await lessonsApi.remove(editing._id); setEditing(null); load(); };

  const done = lessons.filter((l) => l.status === 'done');
  const doneHours = done.reduce((s, l) => s + (l.hours || 0), 0);

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} className="page-title" style={{ margin: 0 }}>Haftalık Ders Takibi</Typography.Title>
        <Space wrap>
          <ClassroomSelect value={classroom} onChange={setClassroom} autoSelect onLoaded={setClassrooms} />
          <Button icon={<LeftOutlined />} onClick={() => setWeek(week.subtract(7, 'day'))} />
          <DatePicker picker="week" value={week} onChange={(d) => d && setWeek(monday(d))} format={(d) => `${monday(d).format('DD MMM')} haftası`} allowClear={false} />
          <Button icon={<RightOutlined />} onClick={() => setWeek(week.add(7, 'day'))} />
          <Button type="primary" icon={<PlusOutlined />} disabled={!classroom} onClick={() => open()}>Ders Ekle</Button>
        </Space>
      </Space>
      {!classroom ? <Empty description="Önce bir sınıf seçin (sınıf yoksa yöneticiden açmasını isteyin)" /> : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}><Card><Statistic title="İşlenen Ders" value={done.length} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="İşlenen Saat" value={doneHours} suffix={cls?.weeklyLessonHours ? `/ ${cls.weeklyLessonHours}` : ''} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="Planlı" value={lessons.filter((l) => l.status === 'planned').length} /></Card></Col>
            <Col xs={12} md={6}><Card><Statistic title="İptal" value={lessons.filter((l) => l.status === 'cancelled').length} /></Card></Col>
          </Row>
          <Row gutter={[12, 12]}>
            {DAYS.map((name, i) => {
              const date = week.add(i, 'day');
              const items = lessons.filter((l) => dayjs(l.date).isSame(date, 'day'));
              return (
                <Col xs={24} sm={12} lg={8} xl={{ flex: "20%" }} key={name}>
                  <Card size="small" title={`${name} ${date.format('DD.MM')}`} extra={<Button size="small" type="text" icon={<PlusOutlined />} onClick={() => open(null, date)} />} style={{ minHeight: 180 }}>
                    {items.length === 0 && <Typography.Text type="secondary">Ders yok</Typography.Text>}
                    {items.map((l) => (
                      <Card key={l._id} size="small" hoverable style={{ marginBottom: 8, borderLeft: `4px solid ${l.status === 'done' ? '#22a06b' : l.status === 'cancelled' ? '#e5484d' : '#8f73ff'}` }} onClick={() => open(l)}>
                        <Space direction="vertical" size={2}>
                          <Space><strong>{l.subject}</strong><Tag color={LESSON_STATUS[l.status].color}>{LESSON_STATUS[l.status].text}</Tag></Space>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{l.topic || '-'} · {l.hours} saat</Typography.Text>
                          {l.absentStudents?.length > 0 && <Typography.Text type="danger" style={{ fontSize: 12 }}>{l.absentStudents.length} devamsız</Typography.Text>}
                        </Space>
                      </Card>
                    ))}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
      <Modal title={editing?._id ? 'Ders Düzenle' : 'Ders Ekle'} open={!!editing} onCancel={() => setEditing(null)} destroyOnClose
        footer={[
          editing?._id && <Popconfirm key="d" title="Ders silinsin mi?" onConfirm={remove}><Button danger icon={<DeleteOutlined />}>Sil</Button></Popconfirm>,
          <Button key="c" onClick={() => setEditing(null)}>Vazgeç</Button>,
          <Button key="s" type="primary" onClick={save}>Kaydet</Button>,
        ]}>
        <Form form={form} layout="vertical">
          <Form.Item name="subject" label="Ders" rules={[{ required: true }]}>
            <Select showSearch options={(cls?.subjects || []).map((s) => ({ value: s, label: s }))} placeholder="Sınıf ayarlarından ders ekleyebilirsiniz" />
          </Form.Item>
          <Space wrap>
            <Form.Item name="date" label="Tarih" rules={[{ required: true }]}><DatePicker format="DD.MM.YYYY" /></Form.Item>
            <Form.Item name="hours" label="Saat"><InputNumber min={0} max={10} /></Form.Item>
            <Form.Item name="status" label="Durum"><Select style={{ width: 130 }} options={Object.entries(LESSON_STATUS).map(([v, s]) => ({ value: v, label: s.text }))} /></Form.Item>
          </Space>
          <Form.Item name="topic" label="İşlenen Konu"><Input /></Form.Item>
          <Form.Item name="absentStudents" label="Devamsız Öğrenciler">
            <Select mode="multiple" optionFilterProp="label" options={students.map((s) => ({ value: s._id, label: `${s.firstName} ${s.lastName}` }))} />
          </Form.Item>
          <Form.Item name="notes" label="Notlar"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
