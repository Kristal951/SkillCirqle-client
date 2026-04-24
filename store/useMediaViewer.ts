import { create } from "zustand";

type Media = {
  images: { url: string; name?: string }[];
  index: number;
};

type MediaViewerState = {
  isOpen: boolean;
  media: Media | null;

  openViewer: (media: Media) => void;
  closeViewer: () => void;
  setIndex: (index: number) => void;
};

export const useMediaViewer = create<MediaViewerState>((set) => ({
  isOpen: false,
  media: null,

  openViewer: (media) =>
    set({
      isOpen: true,
      media,
    }),

  closeViewer: () =>
    set({
      isOpen: false,
      media: null,
    }),

  setIndex: (index) =>
    set((state) => ({
      media: state.media ? { ...state.media, index } : null,
    })),
}));