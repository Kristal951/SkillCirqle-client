"use client";
import React, { useEffect, useState } from "react";
import { Bell, Mail, Zap } from "lucide-react";
import Spinner from "../ui/Spinner";
import OneSignal from "react-onesignal";
import { initOneSignal } from "@/lib/oneSignal";
import BlockedNotificationsHelp from "./BlockedNotificationsHelp";

type Settings = {
  in_app: boolean;
  email_alerts: boolean;
  push_notifications: boolean;
};

type NotificationToggleProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  saving: boolean;
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    in_app: true,
    email_alerts: false,
    push_notifications: true,
  });
  const [saving, setSaving] = useState<keyof Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBlockedHelp, setShowBlockedHelp] = useState(false);

  const persistSetting = async (key: keyof Settings, value: boolean) => {
    const res = await fetch("/api/user/notification-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
  };

  const updateSetting = async (key: keyof Settings) => {
    if (saving) return;
    setSaving(key);
    const previous = settings;

    try {
      let nextValue = !settings[key];

      if (key === "push_notifications" && nextValue) {
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "denied"
        ) {
          setSaving(null);
          setShowBlockedHelp(true);
          return;
        }

        await initOneSignal();
        await OneSignal.Notifications.requestPermission();

        const granted = OneSignal.Notifications.permission;

        if (!granted) {
          nextValue = false;
          await OneSignal.User.PushSubscription.optOut();
          setSettings({ ...settings, push_notifications: false });
          await persistSetting("push_notifications", false);
          setSaving(null);
          
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "denied"
          ) {
            setShowBlockedHelp(true);
          }
          return;
        }

        await OneSignal.User.PushSubscription.optIn();
      } else if (key === "push_notifications" && !nextValue) {
        await initOneSignal();
        await OneSignal.User.PushSubscription.optOut();
      }

      const updated = { ...settings, [key]: nextValue };
      setSettings(updated);
      await persistSetting(key, nextValue);
    } catch (err) {
      console.error(err);
      setSettings(previous);
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/notification-settings");
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 md:py-10 md:px-6 bg-surface/50 rounded-2xl border border-border/50 animate-pulse">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-40 rounded-md bg-surface" />
              <div className="h-3 w-64 rounded-md bg-surface" />
            </div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 rounded-xl border border-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-36 rounded-md bg-surface" />
                    <div className="h-3 w-56 rounded-md bg-surface" />
                  </div>
                </div>
                <div className="w-11 h-6 rounded-full bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:py-10 md:px-6 bg-surface/50 rounded-2xl border border-border/50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bell className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-text-secondary">
              Control how you receive updates and alerts.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <NotificationToggle
            icon={Bell}
            title="In-app Notifications"
            description="Show notifications inside SkillCirqle."
            active={settings.in_app}
            onToggle={() => updateSetting("in_app")}
            saving={saving === "in_app"}
          />
          <NotificationToggle
            icon={Mail}
            title="Email Alerts"
            description="Receive important updates via email."
            active={settings.email_alerts}
            onToggle={() => updateSetting("email_alerts")}
            saving={saving === "email_alerts"}
          />
          <NotificationToggle
            icon={Zap}
            title="Push Notifications"
            description="Receive browser push notifications."
            active={settings.push_notifications}
            onToggle={() => updateSetting("push_notifications")}
            saving={saving === "push_notifications"}
          />
        </div>
      </div>

      {showBlockedHelp && (
        <BlockedNotificationsHelp onClose={() => setShowBlockedHelp(false)} />
      )}
    </div>
  );
};

const NotificationToggle = ({
  icon: Icon,
  title,
  description,
  active,
  onToggle,
  disabled,
  saving,
}: NotificationToggleProps) => (
  <div className="flex items-center justify-between p-4 rounded-xl transition-all">
    <div className="flex gap-4 items-center">
      <div
        className={`p-2 rounded-lg ${active ? "text-text-primary bg-background" : "text-text-secondary bg-surface"} shadow-sm`}
      >
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-xs text-text-secondary max-w-xs">
          {description}
        </span>
      </div>
    </div>
    <button
      onClick={!disabled ? onToggle : undefined}
      disabled={disabled || !!saving}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        active ? "bg-primary" : "bg-border"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {saving ? (
        <div className="h-full w-full flex items-center">
          <Spinner size={15} />
        </div>
      ) : (
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      )}
    </button>
  </div>
);

export default NotificationSettings;
