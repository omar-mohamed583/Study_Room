"use client";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

import React, { useEffect, useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
  onNavigate?: (link: string) => void;
  activeLink?: string;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NAVBAR_SCROLL_THRESHOLD = 100;

export const Navbar = ({
  children,
  className,
  visible: controlledVisible,
}: NavbarProps) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > NAVBAR_SCROLL_THRESHOLD);
  });

  const visible = controlledVisible ?? scrolled;

  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full px-2 pt-3 md:px-4",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 18px 50px -20px rgba(0, 0, 0, 0.5)"
          : "0 4px 20px -12px rgba(0, 0, 0, 0.3)",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full min-w-[800px] max-w-[1200px] flex-row items-center justify-between gap-2 rounded-full border border-[hsl(from_var(--text-primary)_h_s_l_/.1)] bg-[hsl(from_var(--sect-bg)_h_s_l_/.78)] px-2 py-2 text-(--text-primary) backdrop-blur-xl lg:flex",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({
  items,
  className,
  onItemClick,
  onNavigate,
  activeLink,
}: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = items.findIndex((item) => item.link === activeLink);
  const highlighted = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  return (
    <motion.div
      role="navigation"
      aria-label="Primary"
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative hidden flex-1 flex-row items-center justify-center gap-0.5 text-[13px] font-medium lg:flex xl:gap-1 xl:text-sm",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = idx === activeIndex;

        return (
          <button
            key={`link-${idx}`}
            type="button"
            onMouseEnter={() => setHovered(idx)}
            onFocus={() => setHovered(idx)}
            onBlur={() => setHovered(null)}
            onClick={() => {
              onItemClick?.();
              onNavigate?.(item.link);
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative shrink-0 rounded-full px-2.5 py-2 transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) xl:px-3.5",
              isActive
                ? "text-(--text-primary)"
                : "text-(--pale-text) hover:text-(--text-primary)",
            )}
          >
            {highlighted === idx && (
              <motion.span
                layoutId="nav-highlight"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-[hsl(from_var(--text-primary)_h_s_l_/.08)]"
              />
            )}
            <span className="relative z-10">{item.name}</span>
          </button>
        );
      })}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 18px 50px -20px rgba(0, 0, 0, 0.5)"
          : "0 4px 20px -12px rgba(0, 0, 0, 0.3)",
        width: visible ? "90%" : "100%",
        borderRadius: visible ? "1.5rem" : "9999px",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-300 flex-col items-center justify-between rounded-full border border-[hsl(from_var(--text-primary)_h_s_l_/.1)] bg-[hsl(from_var(--sect-bg)_h_s_l_/.78)] px-2 py-2 text-(--text-primary) backdrop-blur-[3px] lg:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between gap-2 px-1",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        document
          .querySelector<HTMLElement>("[data-mobile-nav-toggle]")
          ?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (target.closest("[data-mobile-nav-toggle]")) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          ref={menuRef}
          id="mobile-nav-menu"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-2 flex max-h-[calc(100dvh_-_6rem)] w-full origin-top flex-col items-stretch gap-1 overflow-y-auto rounded-[1.5rem] border border-[hsl(from_var(--text-primary)_h_s_l_/.1)] bg-[hsl(from_var(--sect-bg)_h_s_l_/.98)] p-3 text-(--text-primary) shadow-[0_24px_70px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
            className,
          )}
        >
          {children}
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-menu"
      data-mobile-nav-toggle
      className="grid size-11 shrink-0 place-content-center rounded-full border border-[hsl(from_var(--text-primary)_h_s_l_/.12)] bg-[hsl(from_var(--text-primary)_h_s_l_/.06)] p-2.5 text-(--text-primary) transition-[background-color,scale] duration-200 hover:bg-[hsl(from_var(--text-primary)_h_s_l_/.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) active:scale-95"
    >
      <span
        aria-hidden="true"
        className="relative block h-4 w-5"
      >
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-transform duration-300",
            isOpen && "translate-y-[7px] rotate-45",
          )}
        />
        <span
          className={cn(
            "absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
            isOpen && "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current transition-transform duration-300",
            isOpen && "-translate-y-[7px] -rotate-45",
          )}
        />
      </span>
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <img
        src="https://assets.aceternity.com/logo-dark.png"
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">Startup</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
