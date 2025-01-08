import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ActivityErrorProps {
  message: string;
}

export const ActivityError = ({ message }: ActivityErrorProps) => (
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription className="whitespace-pre-line">{message}</AlertDescription>
  </Alert>
);