import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  open: boolean;
  messages: ChatMessage[];
  unread: number;
  fakeShown: boolean;
  setOpen: (open: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  markRead: () => void;
  showFake: (msg: ChatMessage) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      open: false,
      messages: [],
      unread: 0,
      fakeShown: false,
      setOpen: (open) => set({ open }),
      addMessage: (msg) => set((s) => ({
        messages: [...s.messages, msg],
        unread: msg.role === 'assistant' && !s.open ? s.unread + 1 : s.unread,
      })),
      markRead: () => set({ unread: 0 }),
      showFake: (msg) => set((s) =>
        s.fakeShown ? s : { messages: [msg], fakeShown: true, unread: s.open ? 0 : 1 }
      ),
    }),
    {
      name: 'ai-chat',
      partialize: (s) => ({ messages: s.messages, fakeShown: s.fakeShown, unread: s.unread }),
    }
  )
);
