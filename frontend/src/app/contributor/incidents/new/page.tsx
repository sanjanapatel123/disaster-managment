import DashboardLayout from "@/components/layout/DashboardLayout";
import IncidentManager from "@/components/incidents/IncidentManager";

export default function NewIncidentPage() {
  return (
    <DashboardLayout role="CONTRIBUTOR">
      <IncidentManager role="CONTRIBUTOR" initialCreate />
    </DashboardLayout>
  );
}
