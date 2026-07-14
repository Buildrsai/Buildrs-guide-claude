"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Code2,
  CreditCard,
  Home,
  Package,
  RefreshCcw,
  Settings,
  ShieldAlert,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";

const SECTIONS: {
  label?: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
  {
    items: [
      { href: "/overview", label: "Home", icon: Home },
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/balances", label: "Balances", icon: Wallet },
      { href: "/payouts", label: "Payouts", icon: ArrowUpRight },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/products", label: "Product catalog", icon: Package },
    ],
  },
  {
    label: "Billing",
    items: [{ href: "/subscriptions", label: "Subscriptions", icon: RefreshCcw }],
  },
  {
    label: "Transactions",
    items: [
      { href: "/refunds", label: "Refunds", icon: Undo2 },
      { href: "/disputes", label: "Disputes", icon: ShieldAlert },
    ],
  },
  {
    label: "Reporting",
    items: [{ href: "/reports", label: "Reports", icon: BarChart3 }],
  },
];

const BOTTOM_ITEMS = [
  { href: "/developers", label: "Developers", icon: Code2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md px-2 text-[14px] transition-colors duration-100",
        active
          ? "bg-primary-tint font-medium text-primary"
          : "text-secondary hover:bg-muted-tint",
      )}
    >
      <Icon
        className={cn("h-4 w-4", active ? "text-primary" : "text-muted")}
        strokeWidth={1.75}
      />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-white"
    >
      <div className="px-3 pb-2 pt-3">
        <AccountSwitcher />
      </div>
      <nav className="flex-1 overflow-y-auto px-3">
        {SECTIONS.map((section, i) => (
          <div key={i} className="mb-1">
            {section.label && (
              <div className="label-sm mt-3 mb-1 px-2 text-muted">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-3 py-2">
        <div className="flex flex-col gap-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
