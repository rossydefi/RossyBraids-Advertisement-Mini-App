import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { BRAND_DATA } from '../data/flyerData';
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  Video,
  Star,
  Sparkles,
  Heart,
  CheckCheck,
  Paperclip,
  X,
  ExternalLink,
  ChevronDown,
  Smile,
  ShieldCheck,
  RefreshCw,
  Award,
  ThumbsUp,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingChatInterfaceProps {
  currentClientName?: string;
  currentClientPhone?: string;
  selectedServiceName?: string;
  onPinStyleRequest?: (styleName: string) => void;
  onClose?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    sender: 'stylist',
    text: 'Hello Queen! Welcome to RossyBraids Royal Hair Consultation! 👑✨ I am Rose Iyaji, Master Artisan. How can we crown your beauty today?',
    timestamp: 'Just now',
  },
  {
    id: 'msg-welcome-2',
    sender: 'stylist',
    text: 'Feel free to discuss specific hairstyles, ask about scalp prep, or upload inspiration photos/videos before booking. If we just completed your hair, you can also send your post-hair pictures/videos and share your sweet review!',
    timestamp: 'Just now',
  },
];

export const BookingChatInterface: React.FC<BookingChatInterfaceProps> = ({
  currentClientName = '',
  currentClientPhone = '',
  selectedServiceName = 'Signature Hair Service',
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('rossybraids_chat_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return INITIAL_MESSAGES;
  });

  const [inputMode, setInputMode] = useState<'consult' | 'review'>('consult');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Media attachment state
  const [attachedMedia, setAttachedMedia] = useState<{
    type: 'image' | 'video';
    dataUrl: string;
    fileName: string;
  } | null>(null);

  // Review state for post-hair appreciation
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewService, setReviewService] = useState<string>(selectedServiceName);
  const [clientDisplayName, setClientDisplayName] = useState<string>(currentClientName || 'Cherished Queen');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rossybraids_chat_messages', JSON.stringify(messages));
    } catch {
      // Storage full or restricted
    }
  }, [messages]);

  // Handle media file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isImg && !isVid) {
      alert('Please upload a photo (JPG, PNG) or video clip (MP4, WEBM, MOV).');
      return;
    }

    // Limit to 20MB for browser dataURL
    if (file.size > 20 * 1024 * 1024) {
      alert('Please select a photo or video under 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedMedia({
          type: isVid ? 'video' : 'image',
          dataUrl: reader.result,
          fileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be chosen again if desired
    e.target.value = '';
  };

  // Trigger automated stylist response
  const triggerStylistReply = (userMessage: ChatMessage) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';

      if (userMessage.intentType === 'post_hair_review') {
        replyText = `Aww, thank you so very much, Queen ${clientDisplayName}! 😍👑✨ Your kind review and appreciation mean the absolute world to me and the entire RossyBraids team! Look at that flawless finish—your crown is glowing! May your hair continue to flourish with strength and grace. Always our pleasure! 💖`;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#D4AF37', '#FF69B4', '#FAF7F2'],
        });
      } else if (userMessage.mediaUrl) {
        replyText = `I have received your inspiration ${userMessage.mediaType === 'video' ? 'video' : 'photo'}! 😍✨ This style is absolutely gorgeous! We can definitely achieve this look for you. I have noted these specific details for your appointment. If you haven't booked yet, feel free to proceed with your preferred date!`;
      } else {
        const lower = userMessage.text.toLowerCase();
        if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
          replyText = `Our pricing is transparent and includes scalp protection! Traditional styles start from ₦15,000, Bone-straight revamps from ₦18,000, Boho Braids from ₦25,000, and Loc retwists from ₦20,000. You can also select VIP Home Service if you prefer we style you in the comfort of your residence!`;
        } else if (lower.includes('wash') || lower.includes('clean') || lower.includes('prep')) {
          replyText = `Great question! We provide optional ACV Scalp Detox and steam hydration washes at the studio, or you can arrive freshly washed and blow-dried. Let us know what you prefer and we will pamper your roots! 💆🏾‍♀️`;
        } else if (lower.includes('short') || lower.includes('edge') || lower.includes('sensitive')) {
          replyText = `Rest assured! At RossyBraids, our signature is gentle tension-free braiding. We protect delicate baby hairs and never pull or strain follicles, even on short natural hair. You are in safe hands! ✨`;
        } else {
          replyText = `Thank you for your message! Rose is reviewing your hair specifications. You can also forward this directly to our VIP WhatsApp line at ${BRAND_DATA.whatsapp} for instant confirmation! 👑`;
        }
      }

      const replyMsg: ChatMessage = {
        id: `msg-stylist-${Date.now()}`,
        sender: 'stylist',
        text: replyText,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 1800);
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputText.trim() && !attachedMedia) return;

    const newMsg: ChatMessage = {
      id: `msg-client-${Date.now()}`,
      sender: 'client',
      text: inputText.trim(),
      timestamp: 'Just now',
      mediaType: attachedMedia?.type,
      mediaUrl: attachedMedia?.dataUrl,
      mediaName: attachedMedia?.fileName,
      intentType: attachedMedia ? 'inspo_photo' : 'style_discussion',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachedMedia(null);

    triggerStylistReply(newMsg);
  };

  // Submit Post-Hair Review & Appreciation
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewText = inputText.trim() || 'So in love with my new hairstyle! Thank you RossyBraids for your excellence and gentle hands! 👑✨';

    const newMsg: ChatMessage = {
      id: `msg-review-${Date.now()}`,
      sender: 'client',
      text: reviewText,
      timestamp: 'Just now',
      mediaType: attachedMedia?.type,
      mediaUrl: attachedMedia?.dataUrl,
      mediaName: attachedMedia?.fileName,
      intentType: 'post_hair_review',
      reviewData: {
        rating: reviewRating,
        serviceName: reviewService,
        clientName: clientDisplayName,
        feedback: reviewText,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachedMedia(null);
    setInputMode('consult');

    triggerStylistReply(newMsg);
  };

  // Quick Inspo Chips
  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  // Forward conversation to WhatsApp
  const handleForwardToWhatsApp = () => {
    const lastUserMsgs = messages
      .filter((m) => m.sender === 'client')
      .slice(-3)
      .map((m) => `• ${m.text || (m.mediaUrl ? '[Attached Inspiration Media]' : '')}`)
      .join('\n');

    const whatsappText = encodeURIComponent(
      `Hello Rose / RossyBraids! 👑✨\n` +
        `I am chatting via the RossyBraids App Consultation & Booking Chat:\n\n` +
        `• Client Name: ${clientDisplayName || currentClientName || 'Client'}\n` +
        `• Selected Service: ${selectedServiceName}\n` +
        (lastUserMsgs ? `\nRecent Discussion:\n${lastUserMsgs}\n` : '') +
        `\nI would love to continue discussing my hair styling / review directly with you on WhatsApp!`
    );

    window.open(`https://wa.me/${BRAND_DATA.whatsappRaw}?text=${whatsappText}`, '_blank');
  };

  const handleClearChat = () => {
    if (window.confirm('Reset this consultation chat history?')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('rossybraids_chat_messages');
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-[#DFCEBC] shadow-lg overflow-hidden flex flex-col h-[650px] max-h-[85vh] text-[#2D1B11]">
      {/* Top Stylist Profile Header */}
      <div className="bg-gradient-to-r from-[#2D1B11] via-[#3E2517] to-[#2D1B11] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-2 border-[#D4AF37] bg-[#5C341C] flex items-center justify-center overflow-hidden">
              <span className="font-serif-luxury font-bold text-lg text-[#F9E498]">RI</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#2D1B11]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-[#F9E498] leading-tight">
                Rose Iyaji
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F9E498] font-bold uppercase font-sans-modern">
                Master Artisan
              </span>
            </div>
            <p className="text-[11px] text-[#DFCEBC] font-sans-modern flex items-center gap-1.5">
              <span>RossyBraids Direct Stylist Chat</span>
              <span>•</span>
              <span className="text-emerald-300">Online now</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct WhatsApp Forwarding */}
          <button
            type="button"
            onClick={handleForwardToWhatsApp}
            className="px-2.5 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-sans-modern font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Continue consultation on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-[#DFCEBC]/70 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#DFCEBC] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Banner: Pre-appointment vs Post-hair review */}
      <div className="bg-[#FAF7F2] border-b border-[#DFCEBC] p-2 px-3 flex items-center justify-between text-xs font-sans-modern shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setInputMode('consult')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              inputMode === 'consult'
                ? 'bg-[#2D1B11] text-[#F9E498] font-bold shadow-xs'
                : 'text-[#6C4A32] hover:text-[#2D1B11]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Style Consultation & Inspo</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('review')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              inputMode === 'review'
                ? 'bg-[#B84E1A] text-white font-bold shadow-xs'
                : 'text-[#6C4A32] hover:text-[#B84E1A]'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400 fill-current" />
            <span>Post-Hair Video/Photo Review</span>
          </button>
        </div>

        <span className="hidden md:inline text-[11px] text-[#8F6A1E] font-medium">
          {inputMode === 'consult' ? 'Discuss styles before appointment' : 'Send appreciation after hair is made'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'client';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1 text-[10px] text-[#8C6D53] font-sans-modern px-1">
                <span>{isUser ? clientDisplayName || 'You' : 'Rose Iyaji (Master Artisan)'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs font-sans-modern shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#2D1B11] text-[#FAF7F2] rounded-tr-none border border-[#D4AF37]/30'
                    : 'bg-white text-[#2D1B11] rounded-tl-none border border-[#DFCEBC]'
                }`}
              >
                {/* If post-hair review card */}
                {msg.intentType === 'post_hair_review' && msg.reviewData && (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-black/20 border border-white/15 space-y-1.5 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= msg.reviewData!.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#F9E498] bg-white/10 px-1.5 py-0.2 rounded">
                        Post-Hair Appreciation
                      </span>
                    </div>
                    {msg.reviewData.serviceName && (
                      <span className="text-[11px] text-[#DFCEBC] block">
                        Service: <strong>{msg.reviewData.serviceName}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Media Attachment (Photo or Video) */}
                {msg.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 bg-black/10">
                    {msg.mediaType === 'video' ? (
                      <video
                        src={msg.mediaUrl}
                        controls
                        className="max-h-60 w-full rounded-md object-cover bg-black"
                      />
                    ) : (
                      <img
                        src={msg.mediaUrl}
                        alt="Style inspiration or finished hair"
                        className="max-h-64 w-full object-cover rounded-md cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                      />
                    )}
                    {msg.mediaName && (
                      <div className="p-1 px-2 text-[10px] text-[#DFCEBC] bg-black/40 truncate">
                        {msg.mediaName}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Text */}
                {msg.text && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}

                {/* Read Receipt */}
                <div
                  className={`flex justify-end items-center gap-1 mt-1 text-[9px] ${
                    isUser ? 'text-[#D4AF37]' : 'text-gray-400'
                  }`}
                >
                  <CheckCheck className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#8F6A1E] font-sans-modern animate-pulse pl-1">
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-bold text-[10px]">
              RI
            </div>
            <span>Rose Iyaji is typing a response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Attachment Preview Bar (if selected) */}
      {attachedMedia && (
        <div className="p-2.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs font-sans-modern">
          <div className="flex items-center gap-2 overflow-hidden">
            {attachedMedia.type === 'video' ? (
              <Video className="w-4 h-4 text-[#B84E1A] shrink-0" />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#8F6A1E] shrink-0" />
            )}
            <span className="truncate font-semibold text-[#2D1B11]">
              Attached {attachedMedia.type}: {attachedMedia.fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedMedia(null)}
            className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Suggested Quick Question Chips (In Consultation mode) */}
      {inputMode === 'consult' && (
        <div className="p-2 bg-[#F5EFEB] border-t border-[#DFCEBC] flex items-center gap-1.5 overflow-x-auto text-[11px] font-sans-modern no-scrollbar shrink-0">
          <span className="text-[#8C6D53] shrink-0 font-medium pl-1">Ask:</span>
          {[
            'Can we do bohemian curls on short hair?',
            'Here is my current hair length (photo)',
            'Can you recreate this custom style?',
            'Do I need to wash before coming?',
            'Can we do VIP home service?',
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickQuestion(q)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#DFCEBC] hover:border-[#D4AF37] hover:bg-[#FAF7F2] text-[#6C4A32] hover:text-[#2D1B11] whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Review Mode Panel (If user clicked Post-Hair Video/Photo Review) */}
      {inputMode === 'review' && (
        <form
          onSubmit={handleSubmitReview}
          className="p-3 sm:p-4 bg-gradient-to-r from-[#FAF7F2] to-[#FFFDF9] border-t border-[#DFCEBC] space-y-3 shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-[#2D1B11]">
                Post-Service Photo/Video Review & Appreciation
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setInputMode('consult')}
              className="text-[11px] text-[#8C6D53] hover:text-[#2D1B11] underline cursor-pointer"
            >
              Back to general chat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans-modern">
            {/* Star Rating */}
            <div>
              <span className="text-[11px] text-[#6C4A32] block mb-1">Your Rating for Rose:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-[#8F6A1E] ml-2">
                  {reviewRating === 5 ? 'Masterpiece! 👑' : `${reviewRating} Stars`}
                </span>
              </div>
            </div>

            {/* Client name & Service */}
            <div>
              <span className="text-[11px] text-[#6C4A32] block mb-1">Your Name:</span>
              <input
                type="text"
                value={clientDisplayName}
                onChange={(e) => setClientDisplayName(e.target.value)}
                placeholder="e.g. Amara Kalu"
                className="w-full px-2.5 py-1 text-xs rounded border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Feedback message and media attachment */}
          <div className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-white border border-[#DFCEBC] hover:border-[#D4AF37] text-xs font-sans-modern text-[#6C4A32] flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Attach finished hairstyle photo or video"
            >
              <Camera className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Attach Photo/Video</span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write your review or sweet hair appreciation..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#B84E1A] hover:bg-[#a04316] text-white text-xs font-sans-modern font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Standard Consultation Input Bar */}
      {inputMode === 'consult' && (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-[#DFCEBC] flex items-center gap-2 shrink-0"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-[#8F6A1E] hover:bg-[#FAF7F2] border border-[#DFCEBC] hover:border-[#D4AF37] transition-colors cursor-pointer"
            title="Upload inspiration photo or video clip"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message, ask a style question, or attach inspo..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !attachedMedia}
            className={`px-4 py-2 rounded-lg text-xs font-sans-modern font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              inputText.trim() || attachedMedia
                ? 'bg-[#2D1B11] text-[#F9E498] hover:bg-[#3D2517]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      )}
    </div>
  );
};
