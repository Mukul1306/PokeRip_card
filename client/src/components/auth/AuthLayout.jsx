import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  children,
  title,
  subtitle,
}) {
  return (
    <main className="min-h-screen bg-[#050507] text-white">

      <div className="relative flex min-h-screen overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.18),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(37,99,235,.12),transparent_30%)]" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:45px_45px] opacity-50" />

        {/* Left visual area */}
        <section className="relative hidden flex-1 items-center justify-center lg:flex">

          <div className="relative z-10 max-w-xl px-12">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-black tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles size={18} />
              </div>

              POKERIP
            </Link>

            <p className="mt-12 text-sm font-bold tracking-[.25em] text-violet-400">
              RIP. REVEAL. COLLECT.
            </p>

            <h1 className="mt-5 text-6xl font-black leading-[.9] tracking-[-.06em]">
              Your next
              <br />
              <span className="bg-gradient-to-r from-white via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                pull awaits.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/40">
              Create your account and enter the
              PokeRip collecting experience.
            </p>

            <div className="mt-10 space-y-4">

              <Feature
                icon={Zap}
                title="Interactive ripping"
                text="Shake or tap to open your pack."
              />

              <Feature
                icon={Sparkles}
                title="Live card reveal"
                text="Experience every reveal."
              />

              <Feature
                icon={ShieldCheck}
                title="Secure account"
                text="Your account and purchases stay protected."
              />

            </div>

          </div>

          {/* Decorative pack */}
          <motion.div
            animate={{
              y: [-15, 15, -15],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 right-20 h-64 w-40 rotate-6 rounded-[24px] border border-white/20 bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-950 shadow-[0_30px_100px_rgba(124,58,237,.25)]"
          >
            <div className="flex h-full flex-col justify-between p-5">

              <div className="flex justify-between">
                <span className="text-[8px] font-black tracking-widest text-white/40">
                  PREMIUM
                </span>

                <Sparkles
                  size={15}
                  className="text-yellow-300"
                />
              </div>

              <div className="text-center">

                <div className="mx-auto h-16 w-16 rounded-full bg-white/10 blur-sm" />

                <p className="mt-5 text-xl font-black italic">
                  POKERIP
                </p>

              </div>

              <p className="text-center text-[8px] font-bold tracking-[.25em] text-white/40">
                COLLECTIBLE PACK
              </p>

            </div>
          </motion.div>

        </section>


        {/* Form area */}
        <section className="relative z-10 flex w-full items-center justify-center px-5 py-10 lg:w-[520px] lg:border-l lg:border-white/10 lg:bg-white/[.015] lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <Link
              to="/"
              className="mb-10 flex items-center justify-center gap-2 text-lg font-black lg:hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles size={18} />
              </div>

              POKERIP
            </Link>

            <div className="mb-8">

              <h2 className="text-3xl font-black tracking-tight">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                {subtitle}
              </p>

            </div>

            {children}

          </div>

        </section>

      </div>

    </main>
  );
}


function Feature({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] text-violet-300">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-white/35">
          {text}
        </p>
      </div>

    </div>
  );
}