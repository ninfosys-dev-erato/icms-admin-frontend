'use client';

import React from 'react';
import { 
  Grid, 
  Column, 
  Tile, 
  Tag, 
  Button, 
  ButtonSet,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  ProgressBar,
  SkeletonText
} from '@carbon/react';
import { PageHeader } from '@carbon/ibm-products';
import { 
  Document, 
  UserAvatar, 
  Building, 
  Image, 
  DocumentMultiple_01,
  ArrowRight,
  Calendar,
  User,
  ChartLine,
  Notification
} from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import '@/domains/dashboard/styles/dashboard.css';

interface DashboardStats {
  totalOffices: number;
  totalUsers: number;
  totalContent: number;
  totalSliders: number;
  activeUsers: number;
  pendingApprovals: number;
}

interface RecentActivity {
  id: string;
  type: 'content' | 'user' | 'office' | 'slider';
  action: string;
  user: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export const DashboardHome: React.FC = () => {
  const t = useTranslations();
  const { isNepali } = useLanguageFont();

  // Mock data - in real app, this would come from API
  const stats: DashboardStats = {
    totalOffices: 24,
    totalUsers: 156,
    totalContent: 342,
    totalSliders: 18,
    activeUsers: 89,
    pendingApprovals: 7
  };

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'content',
      action: 'Updated office description',
      user: 'John Doe',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'user',
      action: 'New user registration',
      user: 'Jane Smith',
      timestamp: '4 hours ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'office',
      action: 'Office settings updated',
      user: 'Admin User',
      timestamp: '6 hours ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'slider',
      action: 'Slider image uploaded',
      user: 'Content Manager',
      timestamp: '1 day ago',
      status: 'completed'
    }
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag type="green">Completed</Tag>;
      case 'pending':
        return <Tag type="blue">Pending</Tag>;
      case 'failed':
        return <Tag type="red">Failed</Tag>;
      default:
        return <Tag type="gray">Unknown</Tag>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <Document size={16} />;
      case 'user':
        return <UserAvatar size={16} />;
      case 'office':
        return <Building size={16} />;
      case 'slider':
        return <Image size={16} />;
      default:
        return <Document size={16} />;
    }
  };

  return (
    <div className="dashboard-home">
      {/* Page Header using IBM Products */}
      <PageHeader
        title={isNepali ? 'ड्यासबोर्ड' : 'Dashboard'}
        subtitle={
          isNepali
            ? 'आफ्नो iCMS प्रणालीको सामान्य अवलोकन र प्रबन्धन'
            : 'Overview and management of your iCMS system'
        }
        fullWidthGrid
        narrowGrid
      />

      {/* Statistics Cards */}
      <div className="dashboard-stats-grid">
        <Grid>
          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <Building size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.totalOffices}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'कुल कार्यालयहरू' : 'Total Offices'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <UserAvatar size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.totalUsers}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'कुल प्रयोगकर्ताहरू' : 'Total Users'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <Document size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.totalContent}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'कुल सामग्री' : 'Total Content'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>
        </Grid>

        <Grid style={{ marginTop: '1rem' }}>
          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <Image size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.totalSliders}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'कुल स्लाइडरहरू' : 'Total Sliders'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <User size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.activeUsers}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'सक्रिय प्रयोगकर्ताहरू' : 'Active Users'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>

          <Column lg={4} md={4} sm={4}>
            <Tile className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-icon">
                  <Notification size={24} />
                </div>
                <div className="dashboard-stat-info">
                  <h3 className="dashboard-stat-number font-dynamic">{stats.pendingApprovals}</h3>
                  <p className="dashboard-stat-label font-dynamic">
                    {isNepali ? 'पेन्डिङ स्वीकृतिहरू' : 'Pending Approvals'}
                  </p>
                </div>
              </div>
            </Tile>
          </Column>
        </Grid>
      </div>

      {/* Quick Actions and Recent Activity */}
      <Grid style={{ marginTop: '2rem' }}>
        <Column lg={8} md={4} sm={4}>
          <Tile className="dashboard-activity-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title font-dynamic">
                {isNepali ? 'हालैको गतिविधिहरू' : 'Recent Activity'}
              </h3>
              <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
                {isNepali ? 'सबै हेर्नुहोस्' : 'View All'}
              </Button>
            </div>
            
            <DataTable rows={recentActivity} headers={[]}>
              {({ rows }) => (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>
                        {isNepali ? 'गतिविधि' : 'Activity'}
                      </TableHeader>
                      <TableHeader>
                        {isNepali ? 'प्रयोगकर्ता' : 'User'}
                      </TableHeader>
                      <TableHeader>
                        {isNepali ? 'समय' : 'Time'}
                      </TableHeader>
                      <TableHeader>
                        {isNepali ? 'स्थिति' : 'Status'}
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const activity = recentActivity.find(a => a.id === row.id);
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {getActivityIcon(activity?.type || 'content')}
                              <span className="font-dynamic">{activity?.action}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-dynamic">{activity?.user}</TableCell>
                          <TableCell className="font-dynamic">{activity?.timestamp}</TableCell>
                          <TableCell>
                            {activity ? getStatusTag(activity.status) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile className="dashboard-quick-actions-card">
            <h3 className="dashboard-card-title font-dynamic">
              {isNepali ? 'द्रुत कार्यहरू' : 'Quick Actions'}
            </h3>
            
            <ButtonSet style={{ marginTop: '1rem' }}>
              <Button 
                kind="ghost" 
                renderIcon={DocumentMultiple_01}
                href="/admin/dashboard/office-descriptions"
                className="dashboard-quick-action-btn"
              >
                {isNepali ? 'कार्यालय विवरण सम्पादन गर्नुहोस्' : 'Edit Office Descriptions'}
              </Button>
              
              <Button 
                kind="ghost" 
                renderIcon={Building}
                href="/admin/dashboard/office-settings"
                className="dashboard-quick-action-btn"
              >
                {isNepali ? 'कार्यालय सेटिङहरू' : 'Office Settings'}
              </Button>
              
              <Button 
                kind="ghost" 
                renderIcon={Image}
                href="/admin/dashboard/sliders"
                className="dashboard-quick-action-btn"
              >
                {isNepali ? 'स्लाइडरहरू प्रबन्धन गर्नुहोस्' : 'Manage Sliders'}
              </Button>
              
              <Button 
                kind="ghost" 
                renderIcon={UserAvatar}
                href="/admin/dashboard/human-resources"
                className="dashboard-quick-action-btn"
              >
                {isNepali ? 'मानव संसाधन' : 'Human Resources'}
              </Button>
            </ButtonSet>
          </Tile>
        </Column>
      </Grid>

      {/* System Status */}
      <Grid style={{ marginTop: '2rem' }}>
        <Column lg={12} md={4} sm={4}>
          <Tile className="dashboard-system-status">
            <h3 className="dashboard-card-title font-dynamic">
              {isNepali ? 'प्रणाली स्थिति' : 'System Status'}
            </h3>
            
            <Grid style={{ marginTop: '1rem' }}>
              <Column lg={6} md={4} sm={4}>
                <div className="system-status-item">
                  <div className="system-status-header">
                    <span className="font-dynamic">
                      {isNepali ? 'प्रणाली स्वास्थ्य' : 'System Health'}
                    </span>
                    <Tag type="green">Healthy</Tag>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ProgressBar value={95} label="System Health" />
                  </div>
                </div>
              </Column>
              
              <Column lg={6} md={4} sm={4}>
                <div className="system-status-item">
                  <div className="system-status-header">
                    <span className="font-dynamic">
                      {isNepali ? 'डाटाबेस स्थिति' : 'Database Status'}
                    </span>
                    <Tag type="green">Online</Tag>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ProgressBar value={100} label="Database Status" />
                  </div>
                </div>
              </Column>
            </Grid>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};
