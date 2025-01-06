import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateActivityForm } from "./CreateActivityForm";

interface CreateActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateActivityDialog({ open, onOpenChange, onSuccess }: CreateActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
        </DialogHeader>
        <CreateActivityForm onSuccess={() => {
          onOpenChange(false);
          onSuccess?.();
        }} />
      </DialogContent>
    </Dialog>
  );
}