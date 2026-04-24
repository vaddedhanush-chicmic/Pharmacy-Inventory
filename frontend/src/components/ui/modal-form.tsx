import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface ModalFormProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  maxWidth?: string;
}

export function ModalForm({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  maxWidth = 'max-w-md',
}: ModalFormProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${maxWidth}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {submitLabel}
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
