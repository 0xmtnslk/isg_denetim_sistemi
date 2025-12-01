import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
