import toast from 'react-hot-toast';

export const ConfirmToast = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="flex flex-col gap-3 p-2">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {message || "Are you sure you want to proceed?"}
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            if (onCancel) onCancel();
            toast.dismiss();
          }}
          className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (onConfirm) onConfirm();
            toast.dismiss();
          }}
          className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
