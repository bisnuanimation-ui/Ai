import { createClient } from '@supabase/supabase-js';

// Supabase Connection Credentials
const supabaseUrl = 'https://fzbtrlfaimszaadlsucc.supabase.co';
const supabaseKey = 'sb_publishable_0rzKSiW-XFm9KKd6rNFMxg_eVxu5xrc';

// Initialize the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
  /**
   * Uploads a compressed base64 image directly to the 'Bisun Roy' Storage Bucket
   * @param imageBase64 Base64 string of the image
   * @returns Permanent public HTTP URL of the uploaded asset
   */
  uploadImageToSupabase: async (imageBase64: string): Promise<string> => {
    if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
      return imageBase64;
    }
    try {
      // Parse base64 and determine metadata
      const parts = imageBase64.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'image/jpeg';
      const ext = contentType.split('/')[1] || 'jpg';
      
      // Decode base64 to binary byte array for native upload
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      
      const blob = new Blob([uInt8Array], { type: contentType });
      const fileName = `airport_art_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // Upload Blob to Supabase 'Bisun Roy' Bucket
      const { error } = await supabase.storage
        .from('Bisun Roy')
        .upload(fileName, blob, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get permanent public url for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('Bisun Roy')
        .getPublicUrl(fileName);

      if (publicUrlData && publicUrlData.publicUrl) {
        console.log('🎉 Successfully uploaded image to Supabase Storage:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
      }
      
      throw new Error('Supabase Storage succeeded but did not return publicUrl');
    } catch (err) {
      console.error('Supabase Storage upload failed:', err);
      throw err;
    }
  },

  /**
   * Fetches all public URLs of files uploaded inside the 'Bisun Roy' bucket
   */
  fetchImagesFromSupabase: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase.storage
        .from('Bisun Roy')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        throw error;
      }

      if (data) {
        return data.map((file) => {
          const { data: urlData } = supabase.storage
            .from('Bisun Roy')
            .getPublicUrl(file.name);
          return urlData.publicUrl;
        });
      }
      return [];
    } catch (err) {
      console.warn('Failed to retrieve list from Supabase Storage:', err);
      return [];
    }
  },
};
