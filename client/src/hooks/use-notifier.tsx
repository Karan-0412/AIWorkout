import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type NotifyOptions = {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
  ttl?: number; // ms
};

export function useNotifier() {
  const { toast } = useToast();

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const p = await Notification.requestPermission();
    return p === "granted";
  }, []);

  const notify = useCallback(
    async (opts: NotifyOptions) => {
      // show in-app toast
      const t = toast({
        title: opts.title,
        description: opts.body,
        action: undefined,
        // pass through extra props so Toaster can show icon
        icon: opts.icon,
      } as any);

      // show system notification if possible
      try {
        const allowed = await requestPermission();
        if (allowed && typeof Notification !== "undefined") {
          const n = new Notification(opts.title, {
            body: opts.body,
            icon: opts.icon,
            tag: opts.tag,
          });
          n.onclick = (e) => {
            window.focus();
            if (opts.onClick) opts.onClick();
            try {
              // some browsers require close
              n.close();
            } catch {}
          };
          if (opts.ttl && opts.ttl > 0) {
            setTimeout(() => n.close(), opts.ttl);
          }
        }
      } catch (e) {
        // ignore
      }

      return t;
    },
    [requestPermission, toast],
  );

  return { notify, requestPermission };
}
