import { create } from "zustand";

export type ModalType = "createBoard" | "editBoard";

// interface ModalData {
//   server?: Server;
//   channel?: Channel;
//   channelType?: ChannelType;
//   apiUrl?: string;
//   query?: Record<string,any>;
// }

interface ModalStore {
  type: ModalType | null;
  data: {
    boardId?: string;
    boardTitle?: string;
  };
  isOpen: boolean;
  onOpen: (type: ModalType, data?: any) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
