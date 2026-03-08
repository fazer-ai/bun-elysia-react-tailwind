import { type ReactNode, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children?: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Tooltip wrapper delegates focus to interactive children */}
      <span
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children ?? (
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border text-text-muted text-[10px] font-medium cursor-help"
            role="img"
            aria-label={content}
          >
            ?
          </span>
        )}
      </span>
      {visible &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed -translate-x-1/2 -translate-y-full -mt-1.5 px-2.5 py-1.5 rounded-md bg-bg-primary border border-border text-xs text-text-primary whitespace-nowrap z-100"
            style={{ top: position.top, left: position.left }}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
