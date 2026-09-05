import React, { useState, useRef } from 'react';
import { CustomInspoMedia } from '../types';
import {
  UploadCloud,
  Image as ImageIcon,
  Video,
  X,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface CustomStyleInspoUploadProps {
  currentInspo: CustomInspoMedia | null;
  onInspoChange: (inspo: CustomInspoMedia | null) => void;
  serviceName: string;
}

export const CustomStyleInspoUpload: React.FC<CustomStyleInspoUploadProps> = ({
  currentInspo,
  onInspoChange,
  serviceName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState(currentInspo?.notes || '');
  const [externalLink, setExternalLink] = useState(currentInspo?.externalLink || '');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select a photo (JPG, PNG, WEBP) or video clip (MP4, WEBM, MOV).');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('Media size exceeds 30MB. Please choose a shorter clip or compressed photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const inspoData: CustomInspoMedia = {
          type: isVideo ? 'video' : 'image',
          dataUrl: reader.result,
          fileName: file.name,
          fileSizeBytes: file.size,
          notes: notes.trim(),
          externalLink: externalLink.trim(),
        };
        onInspoChange(inspoData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onInspoChange(null);
    setNotes('');
    setExternalLink('');
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (currentInspo) {
      onInspoChange({
        ...currentInspo,
        notes: val,
      });
    }
  };

  const handleLinkChange = (val: string) => {
    setExternalLink(val);
    if (currentInspo) {
      onInspoChange({
        ...currentInspo,
        externalLink: val,
      });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-5 sm:p-6 rounded-xl border-2 border-dashed border-[#D4AF37]/80 shadow-sm space-y-4 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DFCEBC]/60 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8F6A1E] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#2D1B11] flex items-center gap-2">
              <span>Can't Find Your Desired Look? Upload Your Style Inspiration</span>
            </h2>
            <p className="text-[11px] text-[#6C4A32] font-sans-modern">
              Upload a picture or short video of any custom style, TikTok/Instagram trend, or parting pattern for <strong>{serviceName}</strong>.
            </p>
          </div>
        </div>

        {currentInspo ? (
          <span className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-sans-modern border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Custom Inspo Attached</span>
          </span>
        ) : (
          <span className="self-start sm:self-auto text-[10.5px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#8F6A1E] border border-[#DFCEBC]">
            Optional Bespoke Service
          </span>
        )}
      </div>

      {/* Upload Zone or Current Media Preview */}
      {!currentInspo ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
            isDragging
              ? 'border-[#D4AF37] bg-[#FAF7F2] scale-[1.01]'
              : 'border-[#DFCEBC] hover:border-[#D4AF37] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37]/15 text-[#8F6A1E] flex items-center justify-center shadow-xs">
            <UploadCloud className="w-6 h-6 text-[#8F6A1E]" />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2D1B11] font-sans-modern">
              Click to browse or drag & drop your photo or video here
            </p>
            <p className="text-[11px] text-[#8C6D53] font-sans-modern mt-1">
              Supports JPG, PNG, WEBP photos or MP4, MOV, WEBM videos (up to 30MB)
            </p>
          </div>

          <div className="inline-flex items-center gap-3 pt-1 text-[10.5px] text-[#6C4A32] font-sans-modern">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#8F6A1E]" /> Photos / Screenshots
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-[#B84E1A]" /> TikTok / Reels Video Clips
            </span>
          </div>
        </div>
      ) : (
        /* Attached Media Display */
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFCEBC] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Media Thumbnail */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-black/10 shrink-0 border border-black/15">
                {currentInspo.type === 'video' ? (
                  <video
                    src={currentInspo.dataUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentInspo.dataUrl}
                    alt="Custom hairstyle inspiration"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-white text-[9px] uppercase font-bold">
                  {currentInspo.type}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-[#2D1B11] truncate">
                    {currentInspo.fileName}
                  </h4>
                </div>
                <p className="text-[11px] text-[#6C4A32] font-sans-modern mt-0.5">
                  {currentInspo.type === 'video'
                    ? 'Video clip ready for Master Stylist review'
                    : 'Photo inspiration uploaded'}
                  {currentInspo.fileSizeBytes &&
                    ` • ${(currentInspo.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="text-[11px] font-sans-modern font-semibold text-[#8F6A1E] hover:text-[#2D1B11] flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Media</span>
                  </button>

                  <span className="text-gray-300">•</span>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-sans-modern font-semibold text-[#6C4A32] hover:text-[#2D1B11] cursor-pointer"
                  >
                    Replace File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              title="Remove custom inspiration"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Style Details & Reference Link (available whether file is selected or as additional reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#8F6A1E]" />
            <span>Specific Custom Requests or Variations:</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="e.g. Please do medium square parting, add honey-blonde highlights, and keep curls extra soft at the ends."
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6C4A32] mb-1 font-sans-modern flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[#8F6A1E]" />
            <span>Inspiration Link (Instagram / Pinterest / TikTok):</span>
          </label>
          <input
            type="url"
            value={externalLink}
            onChange={(e) => handleLinkChange(e.target.value)}
            placeholder="https://instagram.com/p/... or tiktok.com/@..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
          />
          <p className="text-[10px] text-[#8C6D53] font-sans-modern mt-1">
            Optional: paste a social link if you don't have the media file saved.
          </p>
        </div>
      </div>

      {/* Media Zoom Preview Modal */}
      {showPreviewModal && currentInspo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#2D1B11] rounded-2xl overflow-hidden border border-[#D4AF37] p-3 text-white space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/15 px-2">
              <span className="text-xs font-serif-luxury font-bold text-[#F9E498]">
                Custom Style Inspiration Preview ({currentInspo.type.toUpperCase()})
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-[#DFCEBC] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-lg bg-black">
              {currentInspo.type === 'video' ? (
                <video
                  src={currentInspo.dataUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] max-w-full rounded-md"
                />
              ) : (
                <img
                  src={currentInspo.dataUrl}
                  alt="Custom Inspiration"
                  className="max-h-[60vh] max-w-full object-contain rounded-md"
                />
              )}
            </div>

            <div className="px-2 text-xs text-[#DFCEBC] font-sans-modern flex items-center justify-between">
              <span>{currentInspo.fileName}</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1 rounded bg-[#D4AF37] text-[#2D1B11] font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
