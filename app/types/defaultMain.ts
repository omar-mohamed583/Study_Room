import type { ReactNode } from "react";

export default interface DefaultMainSecType {
  sectionTitle?: string;
  sectionDescription?: string;
  sectionTitleLogo?: ReactNode | null;
  className?: string;
  children: ReactNode;
  seeMore?: boolean;
  to?: string;
  alignContentBetween?: boolean;
}