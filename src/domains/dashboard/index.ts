// Dashboard Domain Exports

// Components
export { DashboardHome } from './components/dashboard-home';
export { ComprehensiveDashboard } from './components/comprehensive-dashboard';
export { DashboardHeader } from './components/dashboard-header';
export { 
  MetricCardWidget, 
  CompositeMetricCard, 
  StatisticMetricCard 
} from './components/widgets/metric-card-widget';

// Contexts
export { DashboardProvider, useDashboardContext } from './contexts/dashboard-context';

// Hooks
export { 
  useDashboardOverview,
  useRoleBasedDashboard,
  useDashboardConfig,
  useUpdateDashboardConfig,
  useWidgetData,
  useSystemOverview,
  useContentAnalytics,
  useUserAnalytics,
  useHrAnalytics,
  useMarketingAnalytics,
  useDashboardHealth,
  useCacheStats,
  useClearCache,
  useRefreshDashboard,
  useExportDashboard,
  useComprehensiveDashboard,
  dashboardQueryKeys
} from './hooks/use-dashboard-queries';

// Services
export { dashboardApiService } from './services/dashboard-api.service';

// Styles
import './styles/dashboard.css';
import './styles/dashboard-header.css';
import './styles/metric-card-widget.css';
import './styles/comprehensive-dashboard.css';

