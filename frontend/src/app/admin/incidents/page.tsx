import DashboardLayout from "@/components/layout/DashboardLayout";
import IncidentManager from "@/components/incidents/IncidentManager";

export default function AdminIncidentsPage() {
  return (
    <DashboardLayout role="ADMIN">
      <IncidentManager role="ADMIN" />
    </DashboardLayout>
  );
}
