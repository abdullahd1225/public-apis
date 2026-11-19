import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Statistic, List, Tag, Typography, Skeleton, Space, Empty } from 'antd';
import { HomeOutlined, UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import MiniBarChart from '../components/MiniBarChart.jsx';
import RateProgress from '../components/RateProgress.jsx';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [d, setD] = useState();
  useEffect(() => { reportsApi.dashboard().then(setD); }, []);
  if (!d) return <Skeleton active />;

  const stats = [
    { title: 'Sınıf', value: d.classroomCount, icon: <HomeOutlined />, color: '#6d4aff' },
    { title: 'Öğrenci', value: d.studentCount, icon: <UserOutlined />, color: '#22a06b' },
    { title: 'Ödev', value: d.homeworkCount, icon: <BookOutlined />, color: '#f5a524' },
    isAdmin && { title: 'Aktif Öğretmen', value: d.teacherCount, icon: <TeamOutlined />, color: '#ff6b9a' },
  ].filter(Boolean);
  const t = d.homeworkTotals;

  return (
    <>
      <Typography.Title level={3} className="page-title">Merhaba, {user.name} 👋</Typography.Title>
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={12} md={6} key={s.title}>
            <Card className="stat-card"><Statistic title={s.title} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>} /></Card>
          </Col>
        ))}
        <Col xs={24} lg={8}>
          <Card title="Genel Ödev Başarısı" className="stat-card">
            <div style={{ textAlign: 'center' }}><RateProgress rate={d.overallRate} type="dashboard" size={160} /></div>
            <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
              <Tag color="green">Yaptı: {t.done}</Tag><Tag color="gold">Eksik: {t.partial}</Tag>
              <Tag color="red">Yapmadı: {t.not_done}</Tag><Tag>Kontrol bekleyen: {t.pending}</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Haftalık Ders Takibi (son 8 hafta)" className="stat-card"
            extra={<Space size={4}><Tag color="green">İşlendi</Tag><Tag color="purple">Planlı</Tag><Tag color="red">İptal</Tag></Space>}>
            <MiniBarChart data={d.weekly} />
            <Typography.Text type="secondary">Bu hafta: {d.lessonsThisWeek.done} işlendi, {d.lessonsThisWeek.planned} planlı, {d.lessonsThisWeek.cancelled} iptal</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Yaklaşan Ödevler" className="stat-card">
            <List dataSource={d.upcoming} locale={{ emptyText: <Empty description="Yaklaşan ödev yok" /> }}
              renderItem={(h) => (
                <List.Item extra={<Tag color="purple">{dayjs(h.dueDate).format('DD MMM')}</Tag>}>
                  <List.Item.Meta title={h.title} description={`${h.classroom?.name} · ${h.subject || ''}`} />
                </List.Item>
              )} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Destek Gereken Öğrenciler (%50 altı)" className="stat-card">
            <List dataSource={d.atRisk} locale={{ emptyText: <Empty description="Risk altında öğrenci yok 🎉" /> }}
              renderItem={(s) => (
                <List.Item>
                  <List.Item.Meta title={<Link to={`/students/${s.student._id}`}>{s.student.firstName} {s.student.lastName}</Link>}
                    description={`Veli: ${s.student.parentPhone || '-'}`} />
                  <div style={{ width: 140 }}><RateProgress rate={s.rate} /></div>
                </List.Item>
              )} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
