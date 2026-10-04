// Fallback service export to prevent build resolution errors
export const supabaseService = {
  subscribeToPrompts: (callback: (data: any[]) => void) => {
    return () => {};
  },
  savePrompt: async (prompt: any) => {
    return true;
  },
  deletePrompt: async (promptId: string) => {
    return true;
  },
};
