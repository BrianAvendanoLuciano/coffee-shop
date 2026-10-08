'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

export default function Modal({ children, open, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-element'));
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

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
  }, [onClose]);

  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="text-slate-800 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-full max-w-md rounded-xl px-6 py-4 shadow-xl backdrop:bg-black/50"
    >
      {children}
    </dialog>,
    modalRoot,
  );
}
