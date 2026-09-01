import { ActivityFeed } from "@/components/commerce/activity-feed";
import { TopNav } from "@/components/layout/top-nav";

export default function ActivityPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />
      <ActivityFeed />
    </main>
  );
}
