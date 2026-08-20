import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  PackageCheck,
  Settings,
  ShoppingBag,
  Sparkles,
    ShieldCheck,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
  label: "KYC Management",
  path: "/admin/kyc",
  icon: ShieldCheck,
},

  {
    label: "Packs",
    path: "/admin/packs",
    icon: Package,
  },
  {
    label: "Cards",
    path: "/admin/cards",
    icon: CreditCard,
  },
  {
    label: "Pack Odds",
    path: "/admin/odds",
    icon: Sparkles,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: Boxes,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Openings",
    path: "/admin/openings",
    icon: PackageCheck,
  },
  {
    label: "Redemptions",
    path: "/admin/redemptions",
    icon: WalletCards,
  },
  {
    label: "Shipping",
    path: "/admin/shipping",
    icon: Truck,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/10 bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif] text-[#101114] lg:block">
      {/* Import image font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* Logo */}
      <div className="flex h-[72px] items-center border-b border-black/10 px-6">
        <Link to="/admin" className="flex items-center gap-3">
          <div>
           <div>
  <img
    src="https://www.ripit.co/assets/ripit-logo-x4.webp"
    alt="RIPIT"
    className="h-10 w-auto object-contain"
  />
</div>

        
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-72px)] overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[9px] font-black tracking-[.2em] text-[#505258]">
          MANAGEMENT
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#238bdc]/10 text-[#238bdc]"
                    : "text-[#505258] hover:bg-white/40 hover:text-[#101114]"
                }`}
              >
                <Icon size={17} />

                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}