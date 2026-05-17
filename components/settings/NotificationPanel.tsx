"use client";
import React, { useEffect, useState } from "react";
import { Bell, Mail, MessageSquare, Zap, ShieldCheck } from "lucide-react";
import Spinner from "../ui/Spinner";

type Settings = {
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
    email_alerts: true,
    push_notifications: false,
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSetting = async (key: keyof Settings) => {
    setSaving(key);

    const previous = settings;

    const updated = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(updated);

    try {
      const res = await fetch("/api/user/notification-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: updated[key],
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }
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
            icon={Zap}
            title="Push Notifications"
            description="Receive instant app updates."
            active={settings.push_notifications}
            onToggle={() => updateSetting("push_notifications")}
            saving={saving === "push_notifications"}
          />

          <NotificationToggle
            icon={Mail}
            title="Email Alerts"
            description="Receive updates via email."
            active={settings.email_alerts}
            onToggle={() => updateSetting("email_alerts")}
            saving={saving === "email_alerts"}
            disabled
          />

          {/* <NotificationToggle
            icon={MessageSquare}
            title="Direct Mentions"
            description="Notify me when someone mentions me in a cirqle discussion."
            active={settings.mentions}
            onToggle={() => toggle("mentions")}
          />

          <NotificationToggle
            icon={ShieldCheck}
            title="Security Alerts"
            description="Critical updates about your account security and login activity."
            active={true} // Usually forced true for security
            disabled={true}
          /> */}
        </div>
      </div>
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
  <div
    className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
      active
        ? "bg-background/80 border-primary/20"
        : "bg-transparent border-transparent"
    }`}
  >
    <div className="flex gap-4 items-center">
      <div
        className={`p-2 rounded-lg ${active ? "text-primary" : "text-text-secondary"} bg-surface shadow-sm`}
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
          <Spinner size={15}/>
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
