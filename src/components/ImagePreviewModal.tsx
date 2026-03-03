import { X } from 'lucide-react';

type ImagePreviewModalProps = {
  open: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export const ImagePreviewModal = ({ open, src, alt = 'Image preview', onClose }: ImagePreviewModalProps) => {
  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
        aria-label="Close preview"
      >
        <X size={18} />
      </button>

      <img
        src={src}
        alt={alt}
        className="max-h-[85vh] w-auto max-w-full rounded-2xl border border-white/20 bg-white object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
};
