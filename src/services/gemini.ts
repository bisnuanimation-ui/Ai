import { GoogleGenAI } from '@google/genai';

interface PromptGenerationResult {
  title: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  tags: string[];
}

export async function generateAIPromptWithGemini(
  userConcept: string,
  style: string = 'Cinematic Realistic'
): Promise<PromptGenerationResult> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful offline master prompt generator algorithm
    return fallbackPromptEnhancer(userConcept, style);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert AI Prompt Engineer for Midjourney v6, Flux.1, and Stable Diffusion XL.
Convert the user's idea: "${userConcept}" in style "${style}" into a master-grade image generation prompt.

Output ONLY valid JSON with keys:
{
  "title": "A short, catchy, professional 3-6 word title",
  "prompt": "The detailed English prompt with subject, camera, lighting, textures, aspect ratio --ar 4:3 or 16:9, and style parameters",
  "negativePrompt": "Comma separated negative tokens to avoid bad anatomy, blur, etc",
  "model": "Midjourney v6",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}
Do not include markdown backticks around the json, return strictly raw JSON.`,
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      title: parsed.title || 'Masterpiece AI Creation',
      prompt: parsed.prompt || userConcept,
      negativePrompt: parsed.negativePrompt || 'blurry, low quality, deformed, watermark',
      model: parsed.model || 'Midjourney v6',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI Art', 'Masterpiece'],
    };
  } catch (err) {
    console.warn('Gemini API call failed or offline, using fallback prompt generator:', err);
    return fallbackPromptEnhancer(userConcept, style);
  }
}

function fallbackPromptEnhancer(concept: string, style: string): PromptGenerationResult {
  const cleanConcept = concept.trim() || 'futuristic crystal dragon';
  
  const cameraDetails = [
    'cinematic 8k resolution, Hasselblad 100mm lens f/1.8',
    'octane render, volumetric ray tracing, photorealistic textures',
    'dramatic rim lighting, high-contrast chiaroscuro, 85mm portrait lens',
    'soft golden hour daylight, atmospheric haze, ultra detailed 8k',
  ];
  const chosenCam = cameraDetails[Math.floor(Math.random() * cameraDetails.length)];

  const titleWords = cleanConcept.split(' ').slice(0, 4).join(' ');
  const title = titleWords.charAt(0).toUpperCase() + titleWords.slice(1) + ' Vision';

  const prompt = `${cleanConcept}, rendered in breathtaking ${style.toLowerCase()} aesthetic, ${chosenCam}, hyper-detailed micro details, studio color grading, cinematic composition, award-winning digital artwork --ar 4:3 --v 6.0 --style raw`;

  const negativePrompt =
    'blurry, deformed anatomy, bad hands, low resolution, artifacts, pixelated, watermark, signatures, cartoonish oversaturation';

  const tags = [
    style,
    cleanConcept.split(' ')[0] || 'Art',
    'Photorealistic',
    '8K',
    'Midjourney',
  ];

  return {
    title,
    prompt,
    negativePrompt,
    model: 'Midjourney v6',
    tags,
  };
}
