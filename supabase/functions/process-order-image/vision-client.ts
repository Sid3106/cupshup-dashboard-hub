import { ImageAnnotatorClient } from "https://esm.sh/@google-cloud/vision@4.0.2";

export async function createVisionClient() {
  const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
  return credentials;
}

export async function detectText(credentials: any, imageBuffer: Uint8Array): Promise<string | null> {
  try {
    const visionClient = new ImageAnnotatorClient({ credentials });
    const [result] = await visionClient.textDetection(imageBuffer);
    return result.fullTextAnnotation?.text || null;
  } catch (error) {
    console.error('Error detecting text:', error);
    throw error;
  }
}