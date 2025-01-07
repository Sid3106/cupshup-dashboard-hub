import { ImageAnnotatorClient } from "npm:@google-cloud/vision@4.0.2";

export async function createVisionClient() {
  try {
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '');
    
    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      throw new Error('Invalid Google Cloud credentials format');
    }

    return new ImageAnnotatorClient({
      credentials: credentials,
    });
  } catch (error) {
    console.error('Error creating Vision client:', error);
    throw new Error(`Failed to initialize Vision client: ${error.message}`);
  }
}

export async function detectText(client: ImageAnnotatorClient, imageBuffer: Uint8Array) {
  try {
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer
      }
    });

    if (!result?.textAnnotations?.length) {
      console.log('No text detected in image');
      return null;
    }

    const text = result.textAnnotations[0].description;
    console.log('Extracted text:', text);
    return text;
  } catch (error) {
    console.error('Error detecting text:', error);
    throw new Error(`Text detection failed: ${error.message}`);
  }
}