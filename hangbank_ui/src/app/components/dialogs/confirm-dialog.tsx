import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from "@mui/material";
import { useTranslation } from "react-i18next";
  
  interface ConfirmationDialogProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  export default function ConfirmationDialog({
    open,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }: ConfirmationDialogProps) {

    return (
      <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
        {title && <DialogTitle>{title}</DialogTitle>}
  
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={onCancel} color="inherit">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  