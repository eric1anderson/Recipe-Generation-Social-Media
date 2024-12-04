import React from "react";

interface DialogBoxProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="dark:bg-zinc-800 p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-white">{message}</p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DialogBox;
