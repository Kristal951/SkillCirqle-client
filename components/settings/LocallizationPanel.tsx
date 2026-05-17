import React, { useState } from "react";
import { Globe, Clock, MapPin, Calendar, Languages } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const LocalizationSettings = () => {
  const [language, setLanguage] = useState("English (US)");
  const { user } = useAuthStore();
  // const [timezone, setTimezone] = useState("(UTC-08:00) Pacific Time");

  return (
    <div className="flex-1 p-6 md:p-10 bg-surface/50 rounded-2xl border border-border/50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Localization</h1>
            <p className="text-sm text-text-secondary">
              Set your preferred language and region.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1">
              <Languages size={14} />
              Preferred Language
            </label>
            <select
              value={language}
              disabled
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-background/50 border disabled:cursor-not-allowed disabled:opacity-50 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 py-3 px-4 outline-none rounded-xl transition-all appearance-none cursor-pointer"
            >
              <option>English (US)</option>
              <option>Spanish (ES)</option>
              <option>French (FR)</option>
              <option>German (DE)</option>
              <option>Hindi (IN)</option>
            </select>
          </div>

          {/* <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1">
              <Clock size={14} />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-background/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 py-3 px-4 outline-none rounded-xl transition-all appearance-none cursor-pointer"
            >
              <option>(UTC-08:00) Pacific Time</option>
              <option>(UTC+00:00) Greenwich Mean Time</option>
              <option>(UTC+05:30) India Standard Time</option>
              <option>(UTC+01:00) Central European Time</option>
            </select>
          </div> */}

          {/* Date Format */}
          {/* <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1">
              <Calendar size={14} />
              Date Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-3 px-4 rounded-xl border border-primary bg-primary/5 text-primary text-sm font-semibold">
                DD/MM/YYYY
              </button>
              <button className="py-3 px-4 rounded-xl border border-border bg-background/50 text-text-secondary text-sm font-semibold hover:border-primary/50 transition-colors">
                MM/DD/YYYY
              </button>
            </div>
          </div> */}

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1">
              <MapPin size={14} />
              Current Region
            </label>
            <div className="w-full bg-background/30 border opacity-50 border-border/50 py-3 px-4 rounded-xl flex items-center justify-between">
              <span className="text-sm font-medium">
                {user?.location ? (
                  user?.location
                ) : (
                  <p className="text-sm uppercase tracking-wide">Not set</p>
                )}
              </span>
              {/* <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-md font-bold uppercase">
                Auto-detected
              </span> */}
            </div>
          </div>
        </div>

        {/* <div className="mt-4 p-4 bg-background/50 rounded-xl border border-dashed border-border flex gap-3 items-start">
          <span className="material-symbols-outlined text-text-secondary">
            info
          </span>
          <p className="text-xs text-text-secondary leading-relaxed">
            Changing your region may affect the currency displayed for credit
            purchases and the local swap listings shown in your feed.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LocalizationSettings;
