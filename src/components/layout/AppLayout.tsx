import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores/ui-store';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

export function AppLayout() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          collapsed ? 'md:pl-[72px]' : 'md:pl-[260px]',
        )}
      >
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <ErrorBoundary
            fallback={(error, reset) => (
              <ErrorFallback
                error={error}
                reset={reset}
                variant="full"
                title="Page Rendering Error"
                message="We encountered an issue rendering this section of VenuePro. You can retry or navigate to a different section using the sidebar."
              />
            )}
          >
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

