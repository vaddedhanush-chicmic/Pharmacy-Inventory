import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <div className="flex gap-4 mb-4">
          {isDangerous && (
            <AlertTriangle size={32} className="text-[var(--color-red)] flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h2>
            <p className="text-[var(--text-secondary)]">{message}</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="btn btn-secondary" disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={isDangerous ? 'btn btn-danger' : 'btn btn-primary'}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
