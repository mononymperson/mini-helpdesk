import { TicketIcon, UsersIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Role } from '@/lib/types'

export type NavItem = {
  title: string
  url: string
  icon: ReactNode
  roles: Role[]
}

const navItems: NavItem[] = [
  // {
  //   title: "Home",
  //   url: "/",
  //   icon: <HomeIcon />,
  //   roles: ["admin", "agent", "customer"],
  // },
  {
    title: 'Tickets',
    url: '/tickets',
    icon: <TicketIcon />,
    roles: ['admin', 'agent', 'customer'],
  },
  {
    title: 'Users',
    url: '/users',
    icon: <UsersIcon />,
    roles: ['admin'],
  },
]

export function getNavItems(role: Role): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role))
}
