import Reactdom from "react-dom";
import SwipeToast from "./SwipeToast";
import { getIcon } from "../providers/themeContextprovider";
import useTheme from "~/context/themeContext";

export default function NotificationModal() {
  const { toasts, setToasts, theme } = useTheme();

  return Reactdom.createPortal(
    <div
      style={{
        display: "flex",
        position: "fixed",
        right: "1.5rem",
        bottom: "1.5rem",
        flexDirection: "column",
        alignItems: "flex-end",
        // Keep notifications above every site overlay, including portaled dialogs.
        zIndex: 2_147_483_647,
        gap: 10,
      }}
    >
      {toasts.map((toast) => (
        <SwipeToast
          key={toast.id}
          open
          onClose={() => {
            setToasts((prev) => prev.filter((tst) => tst.id !== toast.id));
          }}
          title={toast.title}
          className=""
          inline
          dismissible
          icon={getIcon(toast.icon)}
          description={toast.description}
          actionLabel={toast.actionBtnText || ""}
          onAction={toast.onAction || (() => null)}
          background={theme === "dark" ? "#27272acc" : "hsl(240 4% 90% / 0.5)"}
          color={theme === "dark" ? "#f5f5f5" : "#000"}
          fuseColor={toast?.fuseColor?.trim() ?? "#f5a524"}
          width={356}
          radius={12}
          slideMs={400}
          settleBounce={0.3}
          swipeDistance={40}
          duration={3500}
          fuse="bottom"
          pauseOnHover
          closeButton
        />
      ))}
    </div>,
    document.body,
  );
}
