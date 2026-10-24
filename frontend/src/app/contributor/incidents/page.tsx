import DashboardLayout from "@/components/layout/DashboardLayout";
import IncidentManager from "@/components/incidents/IncidentManager";

export default function ContributorIncidentsPage() {
  return (
    <DashboardLayout role="CONTRIBUTOR">
      <IncidentManager role="CONTRIBUTOR" />
    </DashboardLayout>
  );
}
