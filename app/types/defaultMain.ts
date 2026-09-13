import type { ReactNode, Ref, RefObject } from "react";

export default interface DefaultMainSecType {
  children: ReactNode,
  sectionTitle?: string,
  shrinkable?: boolean,
  bgImage?: string,
  alignContentBetween?: boolean,
}