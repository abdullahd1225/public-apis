import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Grid, Tag } from 'antd';
import {
  DashboardOutlined, TeamOutlined, HomeOutlined, UserOutlined, BookOutlined,
  CalendarOutlined, BarChartOutlined, LogoutOutlined, KeyOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext.jsx';

const { Sider, Header, Content } = Layout;

export default function MainLayout() {
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const screens = Grid.useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { key: '/', icon: <DashboardOutlined />, label: 'Ana Sayfa' },
    isAdmin && { key: '/users', icon: <TeamOutlined />, label: 'Kullanıcılar' },
    { key: '/classrooms', icon: <HomeOutlined />, label: 'Sınıflar' },
    { key: '/students', icon: <UserOutlined />, label: 'Öğrenciler' },
    { key: '/homeworks', icon: <BookOutlined />, label: 'Ödevler' },
    { key: '/lessons', icon: <CalendarOutlined />, label: 'Haftalık Dersler' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
  ].filter(Boolean);
  const selected = items.map((i) => i.key).filter((k) => (k === '/' ? loc.pathname === '/' : loc.pathname.startsWith(k))).pop() || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={screens.xs ? 0 : 80} collapsible collapsed={collapsed} onCollapse={setCollapsed} width={230}>
        <div className="brand">
          <span className="brand-icon">📚</span>
          {!collapsed && <span>Okul Takip</span>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={items} onClick={({ key }) => { nav(key); if (screens.xs) setCollapsed(true); }} />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <KeyOutlined />, label: 'Şifre Değiştir', onClick: () => nav('/profile') },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Çıkış', danger: true, onClick: () => { logout(); nav('/login'); } },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: '#6d4aff' }}>{user.name?.[0]}</Avatar>
              {screens.sm && <Typography.Text strong>{user.name}</Typography.Text>}
              <Tag color={isAdmin ? 'purple' : 'blue'}>{isAdmin ? 'Yönetici' : 'Öğretmen'}</Tag>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: screens.xs ? 12 : 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
