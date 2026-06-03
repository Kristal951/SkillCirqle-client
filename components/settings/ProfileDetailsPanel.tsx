"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Brain, Camera, GraduationCap, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Spinner from "../ui/Spinner";
import {
  optimizeCloudinaryUrl,
  uploadToCloudinary,
} from "@/lib/uploadToCloudinary";
import { addUserSkillsToRequiredTables } from "@/lib/addUserSkillsToRequiredTables";
import { toast } from "@/lib/toast";

const ProfileDetailsPanel = () => {
  const { user, updateUser, isUpdatingUser } = useAuthStore();

  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const email = user?.email || "";
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [initialState, setInitialState] = useState({
    name: "",
    bio: "",
    teachSkills: [] as string[],
    learnSkills: [] as string[],
    avatar: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  const fallbackAvatar = `https://ui-avatars.com/api?name=${encodeURIComponent(
    name || "User",
  )}&background=random&color=fff&bold=true`;

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
  };

  useEffect(() => {
    if (!user) return;

    const init = {
      name: user.name || "",
      bio: user.bio || "",
      teachSkills: user.skills_to_teach || [],
      learnSkills: user.skills_to_learn || [],
      avatar: user.avatar_url || null,
    };

    setInitialState(init);

    setName(init.name);
    setBio(init.bio);
    setTeachSkills(init.teachSkills);
    setLearnSkills(init.learnSkills);
    setAvatarPreview(init.avatar);
  }, [user]);

  useEffect(() => {
    if (!avatarPreview?.startsWith("blob:")) return;

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const arraysEqual = (a: string[], b: string[]) => {
    const sa = [...a].sort();
    const sb = [...b].sort();
    return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
  };

  const isDirty = useMemo(() => {
    const i = initialState;

    return (
      name !== i.name ||
      bio !== i.bio ||
      avatarFile !== null ||
      avatarRemoved ||
      !arraysEqual(teachSkills, i.teachSkills) ||
      !arraysEqual(learnSkills, i.learnSkills)
    );
  }, [
    name,
    bio,
    teachSkills,
    learnSkills,
    avatarFile,
    avatarRemoved,
    initialState,
  ]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarRemoved(false);
    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    e.target.value = "";
  };

  const addTeachSkill = (skill: string) => {
    const value = skill.trim();
    if (!value) return;

    const normalized = value.toLowerCase();

    setTeachSkills((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === normalized);
      if (exists) return prev;

      return [...prev, value];
    });
  };

  const removeTeachSkill = (skill: string) => {
    setTeachSkills((prev) => prev.filter((s) => s !== skill));
  };
  const addLearnSkill = (skill: string) => {
    const value = skill.trim();
    if (!value) return;

    const normalized = value.toLowerCase();

    setLearnSkills((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === normalized);
      if (exists) return prev;

      return [...prev, value];
    });
  };

  const removeLearnSkill = (skill: string) => {
    setLearnSkills((prev) => prev.filter((s) => s !== skill));
  };

  const isValid =
    name.trim().length > 0 &&
    bio.length <= 500 &&
    teachSkills.length <= 5 &&
    learnSkills.length <= 5;

  const displayedAvatar = useMemo(() => {
    if (avatarRemoved) return fallbackAvatar;

    if (avatarPreview) return avatarPreview;

    return initialState.avatar || fallbackAvatar;
  }, [avatarRemoved, avatarPreview, fallbackAvatar, initialState.avatar]);

  const hasRealAvatar = !!initialState.avatar;
  const canSave = isDirty && isValid && !isUpdatingUser;

  const canRemoveAvatar = useMemo(() => {
    if (!hasRealAvatar) return false;
    if (avatarRemoved) return false;
    return true;
  }, [avatarRemoved, hasRealAvatar]);

  const discardChanges = () => {
    setName(initialState.name);
    setBio(initialState.bio);
    setTeachSkills(initialState.teachSkills);
    setLearnSkills(initialState.learnSkills);

    setAvatarFile(null);
    setAvatarRemoved(false);
    setAvatarPreview(initialState.avatar);
  };

  const reset = () => {
    setName(initialState.name);
    setBio(initialState.bio);
    setTeachSkills(initialState.teachSkills);
    setLearnSkills(initialState.learnSkills);
    setAvatarFile(null);
    setAvatarRemoved(false);
    setAvatarPreview(initialState.avatar);
  };

  const handleSave = async () => {
    try {
      const prevUser = useAuthStore.getState().user;

      if (!prevUser) return;

      setLoading(true);

      let avatarUrl = prevUser.avatar_url || fallbackAvatar;

      if (avatarFile) {
        const res = await uploadToCloudinary(avatarFile);
        avatarUrl = optimizeCloudinaryUrl(res.secure_url);
      }

      if (avatarRemoved) {
        avatarUrl = fallbackAvatar;
      }

      const skillsRes = await addUserSkillsToRequiredTables(
        teachSkills,
        learnSkills,
      );

      if (!skillsRes.success) {
        toast.error(skillsRes.message);
        return;
      }

      useAuthStore.setState({
        user: {
          ...prevUser,
          name,
          bio,
          skills_to_teach: teachSkills,
          skills_to_learn: learnSkills,
          avatar_url: avatarUrl,
        },
      });

      const userRes = await updateUser({
        name,
        bio,
        skills_to_teach: teachSkills,
        skills_to_learn: learnSkills,
        avatar_url: avatarUrl,
      });

      if (!userRes.success) {
        useAuthStore.setState({ user: prevUser });
        toast.error(userRes.message || "Failed to update profile");
        return;
      }

      setInitialState({
        name,
        bio,
        teachSkills,
        learnSkills,
        avatar: avatarUrl,
      });

      toast.success("Profile updated successfully");
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-1 lg:col-span-2 p-6 md:p-8 bg-surface/40 backdrop-blur-md z-20 border border-border/10 rounded-3xl shadow-xl flex flex-col gap-8">
      <div className="w-full flex flex-col sm:flex-row gap-6 items-center bg-surface-container/20 p-5 rounded-2xl border border-border/5">
        <div className="relative group shrink-0 w-28 h-28">
          <div className="w-full h-full rounded-full border-4 border-primary/20 bg-primary/5 overflow-hidden flex items-center justify-center ring-4 ring-background shadow-lg">
            <img
              src={displayedAvatar}
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer"
          >
            <Camera className="text-white w-6 h-6" />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Profile Picture
            </h3>
            <p className="text-xs text-text-secondary">PNG, JPG or GIF.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start items-center">
            <label
              htmlFor="avatar-upload"
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:brightness-110 active:scale-[0.97] transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              Upload New
            </label>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={!canRemoveAvatar}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-[0.97]
                ${
                  canRemoveAvatar
                    ? "text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10"
                    : "text-gray-500/40 bg-gray-500/5 cursor-not-allowed"
                }`}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1"
          >
            Display Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background/40 border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/5 py-3 px-4 outline-none rounded-xl transition-all text-sm text-text-primary placeholder:text-text-secondary/40"
            placeholder="Your full name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className="w-full bg-background/20 disabled:opacity-60 disabled:cursor-not-allowed border border-border/40 py-3 px-4 outline-none rounded-xl text-sm text-text-primary/70"
            placeholder="your@email.com"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label
              htmlFor="bio"
              className="text-[10px] font-bold uppercase tracking-widest text-text-secondary"
            >
              Professional Bio
            </label>
            <span
              className={`text-[10px] font-mono ${bio.length > 500 ? "text-red-500 font-bold" : "text-text-secondary/60"}`}
            >
              <span
                className={
                  bio.length > 500 ? "text-red-500" : "text-text-primary"
                }
              >
                {bio.length}
              </span>
              /500
            </span>
          </div>
          <textarea
            id="bio"
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-background/40 border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/5 py-3 px-4 outline-none rounded-xl transition-all text-sm text-text-primary placeholder:text-text-secondary/40 resize-none leading-relaxed"
            placeholder="Tell the Cirqle about your expertise..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center text-text-secondary/80 px-1">
            <span className="material-symbols-outlined text-primary">
              psychology
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Skills I can teach
            </h2>
          </div>

          <div className="w-full bg-background/30 border border-border/60 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 rounded-2xl p-3.5 transition-all flex flex-col gap-3">
            {teachSkills?.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {teachSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-xs font-medium text-text-primary transition-all hover:bg-primary/15"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeTeachSkill(skill)}
                      className="flex items-center justify-center p-0.5 rounded-md text-text-secondary/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary/40 italic py-1 pl-1">
                No teaching tracks configured yet.
              </p>
            )}

            {teachSkills.length < 5 && (
              <input
                type="text"
                className="w-full bg-background/50 border border-border/40 rounded-xl py-2 px-3 text-xs text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-border transition-all"
                placeholder="Type skill and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value.trim();
                    if (!value) return;
                    addTeachSkill(value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center text-text-secondary/80 px-1">
            <span className="material-symbols-outlined text-accent">
              school
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Skills I want to learn
            </h2>
          </div>

          <div className="w-full bg-background/30 border border-border/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5 rounded-2xl p-3.5 transition-all flex flex-col gap-3">
            {learnSkills?.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {learnSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-medium text-text-primary transition-all hover:bg-accent/15"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeLearnSkill(skill)}
                      className="flex items-center justify-center p-0.5 rounded-md text-text-secondary/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary/40 italic py-1 pl-1">
                No execution tracks configured yet.
              </p>
            )}

            {learnSkills.length < 5 && (
              <input
                type="text"
                className="w-full bg-background/50 border border-border/40 rounded-xl py-2 px-3 text-xs text-text-primary placeholder:text-text-secondary/40 outline-none focus:border-border transition-all"
                placeholder="Type skill and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value.trim();
                    if (!value) return;
                    addLearnSkill(value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center pt-4 border-t border-border/30 gap-3">
        {isDirty && !isUpdatingUser && (
          <button
            type="button"
            onClick={discardChanges}
            className="px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-text-secondary/5 rounded-xl transition-all capitalize"
          >
            Discard Changes
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`px-5 py-3 flex items-center gap-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md
            ${
              canSave
                ? "bg-primary text-white hover:brightness-110 shadow-primary/10"
                : "bg-gray-500/10 text-gray-400/50 cursor-not-allowed shadow-none"
            }`}
        >
          {isUpdatingUser && <Spinner size={14} />}
          {isUpdatingUser ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        id="avatar-upload"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>
  );
};

export default ProfileDetailsPanel;
