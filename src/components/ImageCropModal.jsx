import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import { usePlayer } from "../context/PlayerContext";

export default function ImageCropModal({ imageSrc, onComplete, onCancel }) {
  const { barExpanded } = usePlayer();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(blob);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col">
      <div className="flex-1 relative min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          className="cropper-container"
        />
      </div>
      <div className={`p-4 border-t border-zinc-800 bg-zinc-900 flex flex-col gap-4 ${barExpanded ? "pb-20 sm:pb-[5.5rem] md:pb-24" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-zinc-600 text-sm font-medium hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}
