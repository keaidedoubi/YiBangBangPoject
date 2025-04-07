"use client";

import { cn } from "~/lib/util";
import { Check, Xmark } from "iconoir-react";
import { useNotification } from "./NotificationContext";
import { Button, Card } from "@heroui/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface NotificationContent {
  id: number;
  code: number;
  message: string;
  // type: "info" | "success" | "warning" | "error";
}

export function isNotificationContent(content: unknown): content is NotificationContent {
  return content != null && typeof content === "object" && "id" in content && "code" in content && "message" in content;
}

const NotificationBody = ({ content }: { content: NotificationContent }) => {
  const [isDestroyed, setIsDestroyed] = useState(false);

  if (isDestroyed) {
    return null;
  }

  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} className={cn("mx-auto w-full")}>
      <Card isBlurred fullWidth className={cn(
        "relative mx-auto min-h-fit w-full min-w-[200px] max-w-[300px] cursor-pointer overflow-hidden rounded-2xl",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[105%]",
      )}>
        <div className="flex flex-row gap-2 items-center justify-between m-2">
          <div className="flex flex-row gap-2">
            <Card className={cn(
              "p-2 h-10 w-10 rounded-2xl items-center justify-center",
              (content.code >= 200 && content.code < 300) ? "bg-success-400" : "bg-danger-400",
            )}>
              {(content.code >= 200 && content.code < 300) ? <Check /> : <Xmark />}
            </Card>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <p className="text-sm">状态码：{content.code}</p>
                {/* <p>{5 - Math.floor((Date.now() - content.id) / 1000)}</p> */}
              </div>
              <p className="text-sm">信息：{content.message}</p>
            </div>
          </div>
          <Button isIconOnly variant="light" onClick={() => setIsDestroyed(true)}>
            <Xmark />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export function Notification() {
  const {notifications, setNotifications} = useNotification();

  useEffect(() => {
    if (notifications.length === 0) return;
    const interval = setInterval(() => {
      setNotifications(notifications.filter(notification => (Date.now() - notification.id) <= 5000));
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div
      className={cn(
        "fixed items-center flex flex-col gap-4 mt-4",
      )}
      style={{zIndex: 1200}}
    >
      <AnimatePresence>
        {notifications.map((notification, index) => {
          return <NotificationBody key={index} content={notification}/>;
        })}
      </AnimatePresence>
    </div>
  );
}
