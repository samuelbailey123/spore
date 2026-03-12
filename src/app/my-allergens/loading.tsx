import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function MyAllergensLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Allergens</h1>
      <DashboardSkeleton />
    </div>
  );
}
