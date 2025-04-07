import {useSearchParams} from "@remix-run/react";
import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {isNotificationContent, NotificationContent} from "./Notification";

interface NotificationState {
  notifications: NotificationContent[];
  setNotifications: (notifications: NotificationContent[]) => void;
}

const NotificationContext = createContext<NotificationState | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState([] as NotificationContent[]);
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      <GlobalNotification>
        {children}
      </GlobalNotification>
    </NotificationContext.Provider>
  );
};

export const GlobalNotification: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {notice} = useNotification();

  useEffect(() => {
    if(searchParams.has("notice")){
      const content = JSON.parse(searchParams.get("notice") as string);
      searchParams.delete("notice");
      notice(content);
      setSearchParams(searchParams);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    children
  );

};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  const { notifications, setNotifications } = context;
  const notice = function (content: NotificationContent|Omit<NotificationContent,"id">){
    if (!("id" in content)) {
      content = {id: Date.now(), ...content};
    }
    if (isNotificationContent(content) && notifications.indexOf(content) === -1) {
      const newNotifications = [content, ...notifications];
      setNotifications(newNotifications);
    }
  };
  return {
    notifications,
    setNotifications,
    notice,
  };
};


