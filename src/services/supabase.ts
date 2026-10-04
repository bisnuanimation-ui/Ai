import { createClient } from '@supabase/supabase-js';
import { PromptItem } from '../types';

const SUPABASE_URL = 'https://fzbtrlfaimszaadlsucc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0rzKSiW-XFm9KKd6rNFMxg_eVxu5xrc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const supabaseService = {
  subscribeToPrompts: (callback: (prompts: PromptItem[]) => void) => {
    // Initial fetch from Supabase table
    (async () => {
      try {
        const { data, error } = await supabase.from('prompts').select('*');
        if (!error && data && data.length > 0) {
          callback(data as PromptItem[]);
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    })();

    // Realtime changes listener
    const channel = supabase
      .channel('public:prompts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prompts' },
        async () => {
          try {
            const { data, error } = await supabase.from('prompts').select('*');
            if (!error && data) {
              callback(data as PromptItem[]);
            }
          } catch (err) {
            console.warn('Supabase realtime sync notice:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  savePrompt: async (prompt: PromptItem): Promise<boolean> => {
    try {
      const { error } = await supabase.from('prompts').upsert([prompt]);
      if (error) {
        console.warn('Supabase save notice:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase save error:', err);
      return false;
    }
  },

  deletePrompt: async (promptId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('prompts').delete().eq('id', promptId);
      if (error) {
        console.warn('Supabase delete notice:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
      return false;
    }
  },
};
