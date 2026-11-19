import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, Row, Col, Statistic, Tabs, Empty } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { reportsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ClassroomSelect from '../components/ClassroomSelect.jsx';
import RateProgress from '../components/RateProgress.jsx';
import MiniBarChart from '../components/MiniBarChart.jsx';

function ClassroomReport() {
  const [classroom, setClassroom] = useState();
  const [r, setR] = useState();
  useEffect(() => { if (classroom) reportsApi.classroom(classroom).then(setR); }, [classroom]);

  return (
    <>
      <Space wrap style={{ marginBottom: 16 }}>
        <ClassroomSelect value={classroom} onChange={setClassroom} autoSelect />
        <Button icon={<DownloadOutlined />} disabled={!r} onClick={() => reportsApi.classroomCsv(classroom, r.classroom.name)}>Excel (CSV) İndir</Button>
        <Button icon={<PrinterOutlined />} disabled={!r} onClick={() => window.print()}>Yazdır</Button>
      </Space>
      {!r ? <Empty /> : (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card><Statistic title="Sınıf Başarı Oranı" value={r.overallRate ?? '-'} suffix={r.overallRate != null && '%'} /></Card></Col>
          <Col xs={12} md={4}><Card><Statistic title="Yaptı" value={r.totals.done} valueStyle={{ color: '#22a06b' }} /></Card></Col>
          <Col xs={12} md={4}><Card><Statistic title="Eksik" value={r.totals.partial} valueStyle={{ color: '#f5a524' }} /></Card></Col>
          <Col xs={12} md={4}><Card><Statistic title="Yapmadı" value={r.totals.not_done} valueStyle={{ color: '#e5484d' }} /></Card></Col>
          <Col xs={12} md={4}><Card><Statistic title="Öğrenci" value={r.students.length} /></Card></Col>
          <Col xs={24}>
            <Card title="Öğrenci Bazlı Ödev Durumu (en düşükten yükseğe)">
              <Table rowKey={(s) => s.student._id} dataSource={r.students} size="small" scroll={{ x: 800 }} pagination={false}
                columns={[
                  { title: 'Öğrenci', render: (_, s) => <Link to={`/students/${s.student._id}`}>{s.student.firstName} {s.student.lastName}</Link> },
                  { title: 'Verilen', dataIndex: 'totalAssigned' },
                  { title: 'Yaptı', dataIndex: 'done' },
                  { title: 'Eksik', dataIndex: 'partial' },
                  { title: 'Yapmadı', dataIndex: 'not_done' },
                  { title: 'Bekleyen', dataIndex: 'pending' },
                  { title: 'Devamsızlık', dataIndex: 'absences' },
                  { title: 'Başarı', dataIndex: 'rate', width: 180, render: (v) => <RateProgress rate={v} />, sorter: (a, b) => (a.rate ?? -1) - (b.rate ?? -1) },
                  { title: 'Veli Tel.', render: (_, s) => s.student.parentPhone },
                ]} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Haftalık Ders İşlenme Durumu (son 12 hafta)"><MiniBarChart data={r.weekly} /></Card>
          </Col>
        </Row>
      )}
    </>
  );
}

function SchoolOverview() {
  const [list, setList] = useState([]);
  useEffect(() => { reportsApi.overview().then(setList); }, []);
  return (
    <Table rowKey="_id" dataSource={list} scroll={{ x: 600 }}
      columns={[
        { title: 'Sınıf', dataIndex: 'name' },
        { title: 'Yıl', dataIndex: 'academicYear' },
        { title: 'Öğretmen', dataIndex: 'teacher' },
        { title: 'Öğrenci', dataIndex: 'studentCount' },
        { title: 'Başarı', dataIndex: 'overallRate', width: 200, render: (v) => <RateProgress rate={v} />, sorter: (a, b) => (a.overallRate ?? -1) - (b.overallRate ?? -1) },
      ]} />
  );
}

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  return (
    <>
      <Typography.Title level={3} className="page-title">Raporlar</Typography.Title>
      <Tabs items={[
        { key: 'c', label: 'Sınıf Raporu', children: <ClassroomReport /> },
        isAdmin && { key: 'o', label: 'Okul Geneli', children: <SchoolOverview /> },
      ].filter(Boolean)} />
    </>
  );
}
