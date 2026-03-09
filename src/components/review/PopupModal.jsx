import { createPortal } from 'react-dom';

function PopupModal({
  isOpen,
  title,
  message,
  type = 'alert',
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  if (!isOpen) {
    return null;
  }

  const isConfirm = type === 'confirm';

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-primary-4 border border-primary-2/30 rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
        <p className="text-black/80 mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          {isConfirm && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-black/10 text-black hover:bg-black/20 transition-colors font-semibold"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={isConfirm ? onConfirm : onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-2 to-primary-1 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {isConfirm ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modalNode;
  }

  return createPortal(modalNode, document.body);
}

export default PopupModal;
