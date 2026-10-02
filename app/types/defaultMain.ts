import type { ReactNode, RefObject } from "react";

export default interface DefaultMainSecType {
  className?: string;
  sectionTitleLogo?: ReactNode | null;
  children: ReactNode;
  seeMore?: boolean;
  sectionTitle?: string;
  shrinkable?: boolean;
  bgImage?: string;
  to?: string;
  ref?: RefObject<HTMLElement | null>;
  alignContentBetween?: boolean;
}