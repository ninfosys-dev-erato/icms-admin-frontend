import { DashboardLayout } from "@/components/layout/dashboard-layout";
// Localized IBM Products styles for SidePanel & ActionBar (scoped to dashboard segment)
import '@/lib/ibm-products/sidepanel-styles.scss';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
