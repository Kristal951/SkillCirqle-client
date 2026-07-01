"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import type { Editor, Range } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandList = forwardRef<unknown, SlashCommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [props.items]);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) props.command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length,
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary shadow-xl">
          No results
        </div>
      );
    }

    return (
      <div className="w-64 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-xl">
        {props.items.map((item, index) => (
          <button
            key={item.title}
            onClick={() => selectItem(index)}
            className={`w-full flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors ${
              index === selectedIndex
                ? "bg-blue-600 text-white"
                : "hover:bg-background"
            }`}
          >
            <span className="text-sm font-medium">{item.title}</span>
            <span
              className={`text-xs ${
                index === selectedIndex
                  ? "text-white/80"
                  : "text-text-secondary"
              }`}
            >
              {item.description}
            </span>
          </button>
        ))}
      </div>
    );
  },
);

SlashCommandList.displayName = "SlashCommandList";