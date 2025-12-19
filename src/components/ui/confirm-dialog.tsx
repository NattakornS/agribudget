"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Prevent server-side rendering issues
// if (typeof window === 'undefined') {
//   // Mock window object for SSR
//   (global as any).window = {};
// }

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for showing confirm dialog
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setDialogState({
      open: true,
      title,
      description,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
      title={dialogState.title}
      description={dialogState.description}
      onConfirm={dialogState.onConfirm}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
    />
  );

  return { showConfirm, ConfirmDialog: ConfirmDialogComponent };
};
