import { NavLink, Outlet } from 'react-router-dom';
import { Brain, BookHeart, Pill, Activity, BarChart3, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { to: '/', icon: Brain, label: 'Dashboard' },
  { to: '/journal', icon: BookHeart, label: 'Journal' },
  { to: '/medications', icon: Pill, label: 'Medications' },
  { to: '/fitness', icon: Activity, label: 'Fitness' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
];

export default function AppLayout() {
  const { userName, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground leading-none">MindMesh</span>
              <span className="text-[10px] text-primary font-medium tracking-widest uppercase mt-0.5">Companion</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}

            <div className="w-px h-6 bg-border/60 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-foreground">{userName || 'User'}</span>
                <span className="text-[10px] text-muted-foreground">Pro Member</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border/40 overflow-hidden">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>

          {/* Mobile Profile & Logout */}
          <div className="flex lg:hidden items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="rounded-full text-muted-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-border/40">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-background/80 backdrop-blur-2xl border border-white/20 rounded-3xl z-50 shadow-2xl overflow-hidden ring-1 ring-black/5">
        <div className="flex items-center justify-around py-3">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.slice(0, 4)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-28 lg:hidden" />
    </div>
  );
}
