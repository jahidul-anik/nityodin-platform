'use client';

import { usePlatformStore, type ActiveRole } from '@/store/platform-store';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsumerDashboard } from './consumer-dashboard';
import { MerchantDashboard } from './merchant-dashboard';
import { FarmerDashboard } from './farmer-dashboard';
import { ProviderDashboard } from './provider-dashboard';

// ---------------------------------------------------------------------------
// Tab configuration per role
// ---------------------------------------------------------------------------

const ROLE_TABS: Record<ActiveRole, string[]> = {
  consumer: ['Overview', 'Orders', 'Services'],
  merchant: ['Overview', 'Products', 'Orders'],
  farmer: ['Overview', 'Products', 'Market Prices'],
  service_provider: ['Overview', 'Jobs', 'My Services'],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardShell() {
  const activeRole = usePlatformStore((s) => s.activeRole);
  const activeTab = usePlatformStore((s) => s.activeTab);
  const setActiveTab = usePlatformStore((s) => s.setActiveTab);

  const tabs = ROLE_TABS[activeRole];
  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <Tabs
        value={currentTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Dashboard content */}
      <section aria-label={`${activeRole} dashboard`}>
        {activeRole === 'consumer' && <ConsumerDashboard activeTab={currentTab} />}
        {activeRole === 'merchant' && <MerchantDashboard activeTab={currentTab} />}
        {activeRole === 'farmer' && <FarmerDashboard activeTab={currentTab} />}
        {activeRole === 'service_provider' && <ProviderDashboard activeTab={currentTab} />}
      </section>
    </div>
  );
}