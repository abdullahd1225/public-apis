import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Descriptions, Row, Col, Statistic, Table, Tag, Skeleton, Typography, Breadcrumb, List } from 'antd';
import dayjs from 'dayjs';
import { reportsApi } from '../api/client.js';
import { STATUS } from '../theme.js';
import RateProgress from '../components/RateProgress.jsx';

export default function StudentDetailPage() {
  const { id } = useParams();
  const [r, setR] = useState();
  useEffect(() => { reportsApi.student(id).then(setR); }, [id]);
  if (!r) return <Skeleton active />;
  const { student: s, stats } = r;

  return (
    <>
      <Breadcrumb items={[{ title: <Link to="/students">Öğrenciler</Link> }, { title: `${s.firstName} ${s.lastName}` }]} style={{ marginBottom: 12 }} />
      <Typography.Title level={3} className="page-title">{s.firstName} {s.lastName}</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="Öğrenci & Veli Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Öğrenci No">{s.studentNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sınıf">{s.classroom?.name} ({s.classroom?.academicYear})</Descriptions.Item>
              <Descriptions.Item label="Veli">{s.parentName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Telefon">{s.parentPhone ? <a href={`tel:${s.parentPhone}`}>{s.parentPhone}</a> : '-'}</Descriptions.Item>
              <Descriptions.Item label="E-posta">{s.parentEmail ? <a href={`mailto:${s.parentEmail}`}>{s.parentEmail}</a> : '-'}</Descriptions.Item>
              <Descriptions.Item label="Not">{s.notes || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Yıllık Ödev Özeti">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: 'center' }}><RateProgress rate={stats.rate} type="circle" size={120} /></Col>
              <Col xs={24} sm={16}>
                <Row gutter={[8, 8]}>
                  <Col span={8}><Statistic title="Verilen" value={stats.totalAssigned} /></Col>
                  <Col span={8}><Statistic title="Yaptı" value={stats.done} valueStyle={{ color: '#22a06b' }} /></Col>
                  <Col span={8}><Statistic title="Eksik" value={stats.partial} valueStyle={{ color: '#f5a524' }} /></Col>
                  <Col span={8}><Statistic title="Yapmadı" value={stats.not_done} valueStyle={{ color: '#e5484d' }} /></Col>
                  <Col span={8}><Statistic title="Kontrol Bekleyen" value={stats.pending} /></Col>
                  <Col span={8}><Statistic title="Devamsızlık" value={r.absentLessons.length} suffix="ders" /></Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Ödev Geçmişi">
            <Table rowKey="_id" size="small" dataSource={r.homeworks} pagination={{ pageSize: 10 }} scroll={{ x: 500 }}
              columns={[
                { title: 'Ödev', dataIndex: 'title' },
                { title: 'Ders', dataIndex: 'subject' },
                { title: 'Teslim', dataIndex: 'dueDate', render: (d) => dayjs(d).format('DD.MM.YYYY') },
                { title: 'Durum', dataIndex: 'status', render: (st) => <Tag color={STATUS[st].color}>{STATUS[st].text}</Tag> },
                { title: 'Not', dataIndex: 'note' },
              ]} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Devamsız Olduğu Dersler">
            <List size="small" dataSource={r.absentLessons} locale={{ emptyText: 'Devamsızlık yok' }}
              renderItem={(l) => <List.Item><span>{dayjs(l.date).format('DD.MM')} · {l.subject}</span><Typography.Text type="secondary">{l.topic}</Typography.Text></List.Item>} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
