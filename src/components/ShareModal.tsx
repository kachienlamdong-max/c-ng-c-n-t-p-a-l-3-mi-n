import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, QrCode, Smartphone, Monitor, Globe } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);

      QRCode.toDataURL(url, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ba Miền Địa Lý Tự Nhiên Việt Nam',
          text: 'Mô phỏng tương tác ôn tập kiến thức Địa lý 3 miền tự nhiên Việt Nam trên điện thoại & máy tính!',
          url: currentUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>Sử Dụng Trực Tuyến · Không Cần Cài Đặt</span>
          </div>
          <h3 className="text-xl font-bold text-white font-serif tracking-tight">
            Mở Trên Điện Thoại & Máy Tính
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chỉ cần truy cập link này bằng trình duyệt web bất kỳ. Tương thích 100% trên iPhone, Android, iPad và máy tính để bàn.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Mã QR mở ứng dụng"
              className="w-44 h-44 rounded-xl shadow-md border-4 border-white"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-900 rounded-xl text-slate-600 text-xs">
              <QrCode className="w-8 h-8 animate-pulse" />
            </div>
          )}
          <span className="text-[11px] text-slate-400 font-medium">
            Quét mã QR bằng camera điện thoại để mở ngay
          </span>
        </div>

        {/* Copy Link Input & Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-slate-400 block">
            Liên kết trực tiếp (URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép!' : 'Chép link'}</span>
            </button>
          </div>
        </div>

        {/* Share Action */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ qua Zalo, Messenger, Lớp học...</span>
          </button>
        </div>

        {/* Compatibility reassurance badges */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>iOS & Android</span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Windows & Mac</span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-emerald-400 font-medium">100% Miễn phí</span>
        </div>
      </div>
    </div>
  );
};
