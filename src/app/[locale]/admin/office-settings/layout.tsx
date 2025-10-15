import { DashboardLayout } from "@/components/layout/dashboard-layout";
// Ensure IBM Products SidePanel styles are available for this segment
import '@/lib/ibm-products/sidepanel-styles.scss';

export default function ContentManagementLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
