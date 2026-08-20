import {
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/10 bg-[#dedfe1]/90 px-5 font-['Plus_Jakarta_Sans',sans-serif] text-[#101114] backdrop-blur-xl sm:px-8 lg:px-10">
      {/* Import image font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* Mobile logo */}
      <div className="lg:hidden">
        <p className="text-sm font-black text-[#101114]">
          RIP<span className="text-[#238bdc]">IT</span>
        </p>

        <p className="text-[9px] font-bold tracking-[.2em] text-[#238bdc]">
          ADMIN
        </p>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm font-black text-[#101114]">
          Overview
        </p>

        <p className="mt-0.5 text-[10px] font-medium text-[#505258]">
          Manage your RipIt platform
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
     

        <div className="hidden h-8 w-px bg-black/10 sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-black text-[#101114]">
              {user.name || "RipIt Admin"}
            </p>

            <p className="text-[10px] font-medium text-[#505258]">
              Administrator
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238bdc]/10 text-[#238bdc]">
            <UserRound size={18} />
          </div>

          <button
            onClick={logout}
            type="button"
            className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white/40 px-3 py-2 text-[10px] font-bold text-[#505258] transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-[#d9232e] sm:flex"
          >
            <LogOut size={14} />
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}