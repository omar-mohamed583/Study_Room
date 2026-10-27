"use client";
import { useEffect, useState, useTransition } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import {
  CalendarDays,
  ChartPie,
  ClipboardList,
  House,
  LibraryBig,
  ListTodo,
  Moon,
  Settings,
  Sun,
  Timer,
  UserRoundPen,
} from "lucide-react";
import { cn } from "~/lib/utils";
import ShinyText from "../ui/ShinyText";
import useTheme from "~/context/themeContext";
import { useAuth } from "~/components/providers/authProvider";
import DialogComp from "../ui/Dialog";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NAVBAR_SCROLL_THRESHOLD,
} from "~/components/ui/resizable-navbar";
import lightLogo from "~/assets/light-logo.svg";

const navItems = [
  { name: "Home", link: "/", icon: House },
  { name: "Dashboard", link: "/dashboard", icon: ChartPie },
  { name: "Subjects", link: "/subject", icon: LibraryBig },
  { name: "Tasks", link: "/tasks", icon: ListTodo },
  { name: "Exams", link: "/exams", icon: ClipboardList },
  { name: "Calendar", link: "/calendar", icon: CalendarDays },
  { name: "Focus Timer", link: "/focus-timer", icon: Timer },
];

const ICON_BUTTON_CLASS =
  "grid size-9 shrink-0 place-content-center rounded-full text-(--text-primary) transition-[background-color,scale] duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) active:scale-95";

const PROFILE_BUTTON_CLASS =
  "flex h-9 max-w-56 shrink-0 items-center gap-2 rounded-full border border-[hsl(from_var(--text-primary)_h_s_l_/.12)] bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] px-2.5 text-sm font-medium text-(--text-primary) transition-[background-color,scale] duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) active:scale-[0.98]";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"account" | "setting" | null>(null);
  const [, startTransition] = useTransition();

  const { scrollY } = useScroll();
  const [isShrunk, setIsShrunk] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsShrunk(latest > NAVBAR_SCROLL_THRESHOLD);
  });

  const pathname = location.pathname;

  const activeLink =
    navItems.find((item) =>
      item.link === "/"
        ? pathname === "/"
        : pathname === item.link || pathname.startsWith(`${item.link}/`),
    )?.link ?? "";

  const isAuthenticated = Boolean(user);
  const accountLabel = user?.email || user?.username || "Account";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setDialog(null);
  }, [location.pathname]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleTheme = () => {
    startTransition(() => {
      setTheme((current) => (current === "light" ? "dark" : "light"));
    });
  };

  const openDialog = (type: "account" | "setting") => {
    setDialog(type);
    closeMobileMenu();
  };

  return (
    <header className="relative w-full">
      <Navbar visible={isShrunk}>
        <NavBody>
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Study Room home"
            className={cn(
              "relative z-20 flex shrink-0 items-center rounded-full p-0.5 text-(--text-primary) transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)",
              isShrunk ? "gap-0 pr-0.5" : "gap-2 pr-2",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] ring-1 ring-black/10">
              <img
                src={lightLogo}
                alt=""
                aria-hidden="true"
                className="size-6"
              />
            </span>
            <span
              className={cn(
                "inline-block max-w-48 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out",
                isShrunk && "max-w-0 opacity-0",
              )}
            >
              <ShinyText
                text="Study Room"
                speed={2.5}
                delay={0.2}
                color={theme === "light" ? "#1b1b1b" : "#bbbbbb"}
                shineColor={
                  theme === "light" ? "hsl(0, 0%, 50%)" : "hsl(0, 0%, 100%)"
                }
                spread={150}
                direction="left"
                yoyo={false}
                className="font-bold tracking-wide"
                pauseOnHover={false}
                disabled={false}
              />
            </span>
          </button>

          <NavItems
            items={navItems}
            activeLink={activeLink}
            onNavigate={(link) => navigate(link)}
          />

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              title={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              className={ICON_BUTTON_CLASS}
            >
              {theme === "light" ? (
                <Moon
                  className="size-5"
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  className="size-5"
                  aria-hidden="true"
                />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setDialog("account")}
                  aria-label={`Open account${user?.email ? ` for ${user.email}` : ""}`}
                  aria-haspopup="dialog"
                  title={accountLabel}
                  className={PROFILE_BUTTON_CLASS}
                >
                  <UserRoundPen
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "max-w-32 truncate",
                      isShrunk ? "hidden" : "hidden xl:inline",
                    )}
                  >
                    {accountLabel}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDialog("setting")}
                  aria-label="Open settings"
                  aria-haspopup="dialog"
                  title="Settings"
                  className={ICON_BUTTON_CLASS}
                >
                  <Settings
                    className="size-5"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                aria-label="Log in"
                className={PROFILE_BUTTON_CLASS}
              >
                <UserRoundPen
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="hidden xl:inline">Log in</span>
              </button>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Study Room home"
              className={cn(
                "relative z-20 flex min-w-0 shrink items-center rounded-full p-0.5 text-(--text-primary) transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)",
                isShrunk ? "gap-0 pr-0.5" : "gap-2 pr-1",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] ring-1 ring-black/10">
                <img
                  src={lightLogo}
                  alt=""
                  aria-hidden="true"
                  className="size-6"
                />
              </span>
              <span
                className={cn(
                  "inline-block max-w-48 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out",
                  isShrunk && "max-w-0 opacity-0",
                )}
              >
                <ShinyText
                  text="Study Room"
                  speed={2.5}
                  delay={0.2}
                  color={theme === "light" ? "#1b1b1b" : "#bbbbbb"}
                  shineColor={
                    theme === "light" ? "hsl(0, 0%, 50%)" : "hsl(0, 0%, 100%)"
                  }
                  spread={150}
                  direction="left"
                  yoyo={false}
                  className="font-bold tracking-wide"
                  pauseOnHover={false}
                  disabled={false}
                />
              </span>
            </button>

            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          >
            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--pale-text)">
              Menu
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.link === activeLink;

              return (
                <button
                  key={item.link}
                  type="button"
                  onClick={() => {
                    navigate(item.link);
                    closeMobileMenu();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)",
                    isActive
                      ? "bg-[hsl(from_var(--text-primary)_h_s_l_/.1)] text-(--text-primary)"
                      : "text-(--pale-text) hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] hover:text-(--text-primary)",
                  )}
                >
                  <Icon
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}

            <div className="my-1 h-px bg-[hsl(from_var(--text-primary)_h_s_l_/.1)]" />

            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--pale-text)">
              Personal
            </p>

            <button
              type="button"
              onClick={() => {
                toggleTheme();
                closeMobileMenu();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--pale-text) transition-colors duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)"
            >
              {theme === "light" ? (
                <Moon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
              )}
              <span>
                {theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"}
              </span>
            </button>

            {!isAuthPage &&
              (isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => openDialog("account")}
                    aria-haspopup="dialog"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--pale-text) transition-colors duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)"
                  >
                    <UserRoundPen
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Account</span>
                    <span className="ml-auto max-w-32 truncate text-xs text-(--pale-text)">
                      {accountLabel}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openDialog("setting")}
                    aria-haspopup="dialog"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--pale-text) transition-colors duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)"
                  >
                    <Settings
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Settings</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-(--pale-text) transition-colors duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary)"
                >
                  <UserRoundPen
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Log in</span>
                </button>
              ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <DialogComp
        dialogType="account"
        open={dialog === "account"}
        onOpenChange={(open) => setDialog(open ? "account" : null)}
      />
      <DialogComp
        dialogType="setting"
        open={dialog === "setting"}
        onOpenChange={(open) => setDialog(open ? "setting" : null)}
      />
    </header>
  );
}
