// Dashboard Types - Frontend representation of backend DTOs

// ========================================
// SYSTEM OVERVIEW TYPES
// ========================================

export interface SystemHealth {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
  recentErrors: number;
  message: string;
  lastChecked: Date;
}

export interface StorageMetrics {
  used: string;
  total: string;
  usedPercentage: number;
  largestConsumer: string;
  monthlyGrowth: string;
}

export interface SystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalMedia: number;
  totalArticles: number;
  totalDepartments: number;
  storage: StorageMetrics;
  systemHealth: SystemHealth;
  lastUpdated: Date;
}

// ========================================
// CONTENT ANALYTICS TYPES
// ========================================

export interface TopContent {
  id: string;
  title: string;
  views: number;
  trend: string;
  type: string;
  lastAccessed: Date;
}

export interface ContentGrowth {
  monthly: number;
  trend: string;
  weekly: number;
  daily: number;
}

export interface ContentAnalytics {
  topDocuments: TopContent[];
  topMedia: TopContent[];
  topArticles: TopContent[];
  documentGrowth: ContentGrowth;
  mediaGrowth: ContentGrowth;
  articleGrowth: ContentGrowth;
  totalDownloads: number;
  totalViews: number;
  averageEngagement: number;
}

// ========================================
// USER ANALYTICS TYPES
// ========================================

export interface UserGrowth {
  monthly: number;
  trend: string;
  weekly: number;
  daily: number;
}

export interface RoleDistribution {
  admin: number;
  editor: number;
  user: number;
  manager: number;
}

export interface ActiveUser {
  id: string;
  name: string;
  actions: number;
  lastActive: string;
  role: string;
}

export interface UserAnalytics {
  userGrowth: UserGrowth;
  roleDistribution: RoleDistribution;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  topActiveUsers: ActiveUser[];
  averageSessionDuration: number;
  averageActionsPerSession: number;
}

// ========================================
// HR ANALYTICS TYPES
// ========================================

export interface DepartmentMetrics {
  name: string;
  count: number;
  growth: string;
  satisfaction: number;
  status: string;
}

export interface HrMetrics {
  turnoverRate: number;
  averageTenure: number;
  recentHires: number;
  pendingApprovals: number;
  documentCompliance: number;
}

export interface HrAnalytics {
  totalEmployees: number;
  departments: DepartmentMetrics[];
  metrics: HrMetrics;
  openPositions: number;
  trainingPrograms: number;
  employeeSatisfaction: number;
}

// ========================================
// MARKETING ANALYTICS TYPES
// ========================================

export interface SliderPerformance {
  id: string;
  title: string;
  views: number;
  clicks: number;
  clickThroughRate: number;
  trend: string;
}

export interface SearchTrends {
  query: string;
  searches: number;
  trend: string;
  successRate: number;
}

export interface MarketingAnalytics {
  topSliders: SliderPerformance[];
  topSearches: SearchTrends[];
  averageClickThroughRate: number;
  totalBannerViews: number;
  totalBannerClicks: number;
  uniqueVisitors: number;
}

// ========================================
// DASHBOARD RESPONSE TYPES
// ========================================

export interface DashboardOverview {
  system: SystemOverview;
  content: ContentAnalytics;
  users: UserAnalytics;
  hr: HrAnalytics;
  marketing: MarketingAnalytics;
  generatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'widget' | 'chart' | 'table' | 'metric';
  enabled: boolean;
  order: number;
  data: any;
}

export interface DashboardConfig {
  id: string;
  name: string;
  role: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'list' | 'custom';
  autoRefresh: boolean;
  refreshInterval: number;
}

// ========================================
// QUERY TYPES
// ========================================

export interface DashboardQuery {
  dateFrom?: Date;
  dateTo?: Date;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  role?: string;
  category?: 'system' | 'content' | 'users' | 'hr' | 'marketing' | 'all';
  includeTrends?: boolean;
  limit?: number;
}

// ========================================
// EXPORT TYPES
// ========================================

export interface DashboardExport {
  filename: string;
  contentType: string;
  size: number;
  exportedAt: Date;
  exportedBy: string;
}

// ========================================
// CACHE TYPES
// ========================================

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  keys: string[];
}

export interface DashboardHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  cacheHealth: boolean;
  lastUpdated: Date;
}

// ========================================
// WIDGET SPECIFIC TYPES
// ========================================

export interface MetricCardData {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color?: string;
  subtitle?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface TableData {
  headers: string[];
  rows: Array<Record<string, any>>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// ========================================
// DASHBOARD STATE TYPES
// ========================================

export interface DashboardState {
  overview: DashboardOverview | null;
  config: DashboardConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface DashboardFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  category: 'system' | 'content' | 'users' | 'hr' | 'marketing' | 'all';
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  includeTrends: boolean;
}
