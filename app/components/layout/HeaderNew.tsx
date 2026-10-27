"use client";
import { useState, useMemo, useTransition } from "react";
import { Link } from "react-router";
import ShinyText from "../ui/ShinyText";
import useTheme from "~/context/themeContext";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "~/components/ui/resizable-navbar";
import DialogComp from "../ui/Dialog";
import { useAuth } from "../providers/authProvider";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, startTransition] = useTransition();

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Tasks",
      link: "/tasks",
    },
    {
      name: "Subjects",
      link: "/subject",
    },
    {
      name: "Calendar",
      link: "/calendar",
    },
    {
      name: "Focus Timer",
      link: "/focus-timer",
    },
  ];

  const PERSONAL_ITEMS = useMemo(
    () => [
      {
        id: crypto.randomUUID(),
        name: "Account",
        svg: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user-pen preview-icon"
          >
            <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
            <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
            <circle cx="10" cy="7" r="4" />
          </svg>
        ),
        toLocation: "/",
      },
      {
        id: crypto.randomUUID(),
        name: "Setting",
        svg: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-settings preview-icon"
          >
            <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
        toLocation: "/",
      },
    ],
    [],
  );

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <Link to="/" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1">
            <ShinyText
              text="Study Room"
              speed={2.5}
              delay={0.2}
              color={theme === "light" ? "#1b1b1b" : "#bbbbbb"}
              shineColor={theme === "light" ? "hsl(0, 0%, 50%)" : "hsl(0, 0%, 100%)"}
              spread={150}
              direction="left"
              yoyo={false}
              className=""
              pauseOnHover={false}
              disabled={false}
            />
          </Link>
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              onClick={() => {
                startTransition(() => {
                  setTheme(theme === "light" ? "dark" : "light");
                });
              }}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <div className="relative">
              <NavbarButton
                variant="secondary"
                as="button"
                onClick={(e: any) => {
                  // We'll use a simple approach - open dialog via custom event
                  const event = new CustomEvent("open-account-dialog");
                  window.dispatchEvent(event);
                }}
              >
                Account
              </NavbarButton>
            </div>
            <NavbarButton
              variant="primary"
              as="button"
              onClick={(e: any) => {
                const event = new CustomEvent("open-settings-dialog");
                window.dispatchEvent(event);
              }}
            >
              Settings
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link to="/" className="relative z-20 flex items-center space-x-2 px-2 py-1">
              <ShinyText
                text="Study Room"
                speed={2.5}
                delay={0.2}
                color={theme === "light" ? "#1b1b1b" : "#bbbbbb"}
                shineColor={theme === "light" ? "hsl(0, 0%, 50%)" : "hsl(0, 0%, 100%)"}
                spread={150}
                direction="left"
                yoyo={false}
                className=""
                pauseOnHover={false}
                disabled={false}
              />
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                to={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 w-full"
              >
                <span className="block py-2">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  startTransition(() => {
                    setTheme(theme === "light" ? "dark" : "light");
                  });
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-neutral-600 dark:text-neutral-300"
              >
                Toggle Theme
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent("open-account-dialog");
                  window.dispatchEvent(event);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-neutral-600 dark:text-neutral-300"
              >
                Account
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent("open-settings-dialog");
                  window.dispatchEvent(event);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-neutral-600 dark:text-neutral-300"
              >
                Settings
              </button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
