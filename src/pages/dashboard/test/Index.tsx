import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setOrderId(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderId(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('order_images')
        .getPublicUrl(fileName);

      console.log('Calling Edge Function with image URL:', publicUrl);

      // Process image with Google Cloud Vision API using Edge Function
      const { data, error: functionError } = await supabase.functions
        .invoke('process-order-image', {
          body: { imageUrl: publicUrl },
          headers: {
            'Content-Type': 'application/json',
          }
        });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        throw functionError;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('test')
        .insert({
          order_image: publicUrl,
          order_id: data.orderId,
        });

      if (dbError) throw dbError;

      setOrderId(data.orderId);
      toast({
        title: "Success",
        description: "Order image processed successfully",
      });
    } catch (error: any) {
      console.error('Error processing order:', error);
      setError(error.message || 'Failed to process the image. Please try again.');
      toast({
        title: "Error",
        description: "Failed to process order image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Test Order Processing</h2>
          <p className="text-muted-foreground">
            Upload an order image to extract the order ID using Google Cloud Vision OCR
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Order Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {orderId && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Extracted Order ID:</p>
                <p className="text-lg">{orderId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}