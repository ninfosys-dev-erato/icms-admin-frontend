import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function SettingsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
