import { Suspense, type CSSProperties, type ReactNode } from 'react'

import { BreadcrumbProvider } from '@/components/breadcrumb-context'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="h-4 w-28" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-2 p-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebar />
      </Suspense>
      <SidebarInset>
        <BreadcrumbProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
