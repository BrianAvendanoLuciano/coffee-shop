'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  // id of the element that titles the dialog, announced by screen readers.
  labelledBy?: string;
};

const subscribe = () => () => {};
const getModalRoot = () => document.getElementById('modal-element');
const getServerModalRoot = () => null;

export default function Modal({
  children,
  open,
  onClose,
  labelledBy,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The portal target only exists in the browser. This reads it without a
  // setState-in-effect round trip, and returns null while server rendering.
  const modalRoot = useSyncExternalStore(
    subscribe,
    getModalRoot,
    getServerModalRoot,
  );

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, modalRoot]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose, modalRoot]);

  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className="text-slate-800 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-full max-w-md rounded-xl px-6 py-4 shadow-xl backdrop:bg-black/50"
    >
      {children}
    </dialog>,
    modalRoot,
  );
}
