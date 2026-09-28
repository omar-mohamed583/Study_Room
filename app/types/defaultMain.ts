import type { ReactNode, Ref, RefObject } from "react";

export default interface DefaultMainSecType {
  className?: string,
  children: ReactNode,
  sectionTitle?: string,
  shrinkable?: boolean,
  bgImage?: string,
  ref?: RefObject<HTMLElement | null>
  alignContentBetween?: boolean,
}