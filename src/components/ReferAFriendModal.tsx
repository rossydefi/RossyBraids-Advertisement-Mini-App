import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Crown,
  Sparkles,
  Clock,
  ArrowRight,
  MessageCircle,
  X,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReferralDiscountReward, ReferralProfile } from '../types';
import {
  generateUniqueReferralCode,
  getMostExpensiveWig,
  getReferralShareUrl,
  getStoredReferralProfile,
  saveReferralProfile,
  getAllStoredDiscountRewards,
  getTimeRemaining,
} from '../utils/referral';
import { BRAND_DATA, PRODUCTS_SHOP_DATA } from '../data/flyerData';

interface ReferAFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShopWithWig?: (wigId: string, discountCode?: string) => void;
  onNavigateToBooking?: () => void;
}

export const ReferAFriendModal: React.FC<ReferAFriendModalProps> = ({
  isOpen,
  onClose,
  onNavigateToShopWithWig,
  onNavigateToBooking,
}) => {
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'invite' | 'rewards'>('invite');
  const [rewards, setRewards] = useState<ReferralDiscountReward[]>([]);

  // Dynamically evaluate the current most expensive wig
  const mostExpensiveWig = getMostExpensiveWig(PRODUCTS_SHOP_DATA);
  const discountSavings = Math.round(mostExpensiveWig.price * 0.25);
  const discountedPrice = mostExpensiveWig.price - discountSavings;

  useEffect(() => {
    if (isOpen) {
      const existingProfile = getStoredReferralProfile();
      if (existingProfile) {
        setProfile(existingProfile);
        setUserName(existingProfile.referrerName);
        if (existingProfile.referrerPhone) setUserPhone(existingProfile.referrerPhone);
      }
      setRewards(getAllStoredDiscountRewards());
    }
  }, [isOpen]);

  // Live timer tick for reward countdowns
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setRewards(getAllStoredDiscountRewards());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const code = generateUniqueReferralCode(userName);
    const newProfile: ReferralProfile = {
      referralCode: code,
      referrerName: userName.trim(),
      referrerPhone: userPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
      totalReferrals: profile ? profile.totalReferrals : 0,
      successfulBookings: profile ? profile.successfulBookings : 0,
    };

    saveReferralProfile(newProfile);
    setProfile(newProfile);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const referralUrl = profile ? getReferralShareUrl(profile.referralCode) : '';

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!profile) return;
    const message = `Hey babe! ✨ Check out RossyBraids for luxury braids, bone-straight hair, and custom wigs. 

Book your appointment using my exclusive VIP referral link:
👉 ${referralUrl}

🎁 When you book, we BOTH unlock an exclusive 3-day discount code for their MOST EXPENSIVE luxury wig (${mostExpensiveWig.name})! The discount strictly expires in 72 hours, so don't miss it! 👑💖`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="refer-a-friend-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#1A0F08] border border-[#D4AF37]/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#FAF6F0]">
        {/* Header Ribbon */}
        <div className="relative px-5 py-5 sm:px-6 bg-gradient-to-r from-[#2A170C] via-[#3B2112] to-[#2A170C] border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5E6A3] text-[#2A170C] flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-sans-modern font-bold text-[#F5E6A3]">
                  Double Luxury Reward
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Strictly 3-Day Window
                </span>
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                Refer a Friend & Earn Flagship Wig Discounts
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCEBC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Generate / Share Link vs My Unlocked Codes */}
        <div className="px-5 pt-3 pb-1 border-b border-[#D4AF37]/15 bg-[#140B05] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('invite')}
            className={`px-4 py-2 rounded-xl text-xs font-sans-modern font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'invite'
                ? 'bg-[#D4AF37] text-[#2A170C] shadow-sm'
                : 'text-[#DFCEBC] hover:bg-white/5'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Generate & Share VIP Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-sans-modern font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeSubView === 'rewards'
                ? 'bg-[#D4AF37] text-[#2A170C] shadow-sm'
                : 'text-[#DFCEBC] hover:bg-white/5'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>My Wig Discount Codes</span>
            {rewards.filter((r) => !r.isUsed && !getTimeRemaining(r.expiresAt).isExpired).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm font-sans-modern">
          {activeSubView === 'invite' ? (
            <>
              {/* Highlight Card: The Strict Target Wig at This Time */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#24130A] to-[#180C06] border border-[#D4AF37]/50 shadow-md flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={mostExpensiveWig.image}
                  alt={mostExpensiveWig.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-[#D4AF37]/40 shrink-0 shadow-md"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6A3] text-[10px] font-bold uppercase tracking-wider">
                    <Crown className="w-3 h-3 text-[#D4AF37]" />
                    <span>Exclusive Reward: Most Expensive Wig at RossyBraids</span>
                  </div>
                  <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-white line-clamp-1">
                    {mostExpensiveWig.name}
                  </h4>
                  <p className="text-[#DFCEBC] text-xs line-clamp-2">
                    {mostExpensiveWig.description}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="text-xs text-[#DFCEBC]/60 line-through">
                      Original: {mostExpensiveWig.formattedPrice}
                    </span>
                    <span className="text-sm sm:text-base font-cinzel font-bold text-emerald-400">
                      With Referral Discount: ₦{discountedPrice.toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      Save ₦{discountSavings.toLocaleString()} (25% OFF)
                    </span>
                  </div>
                </div>
              </div>

              {/* Strict Rule Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold block">
                    Strict Referral Rules:
                  </strong>
                  1. The discount code is <strong>strictly valid for the most expensive wig</strong> in our salon collection at the time of booking.
                  <br />
                  2. The discount code <strong>strictly expires after three (3) days (72 hours)</strong> from the moment the new client completes their appointment booking.
                </div>
              </div>

              {/* Profile / Link Generation */}
              {!profile ? (
                <form onSubmit={handleGenerateLink} className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/5">
                  <div className="space-y-1">
                    <h4 className="font-serif-luxury text-sm font-bold text-[#F5E6A3]">
                      Step 1: Create Your Unique Referral Link
                    </h4>
                    <p className="text-xs text-[#DFCEBC]">
                      Enter your name to generate your personalized RossyBraids VIP referral link:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFCEBC] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chidinma Okafor"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-hidden text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFCEBC] mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08123456789"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-hidden text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text-[#2A170C] font-bold text-xs hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Unique Referral Link</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#DFCEBC]/70 uppercase font-bold tracking-wider">
                        Your Unique VIP Referral Code
                      </span>
                      <h4 className="font-cinzel text-lg font-bold text-[#F5E6A3]">
                        {profile.referralCode}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        Successful Bookings
                      </span>
                      <span className="font-cinzel text-base font-bold text-white">
                        {profile.successfulBookings}
                      </span>
                    </div>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#DFCEBC] font-semibold flex items-center justify-between">
                      <span>Your Unique Referral Link:</span>
                      <span className="text-[10px] text-[#D4AF37]">Click to copy & share</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={referralUrl}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#D4AF37] text-[#2A170C] hover:bg-[#E5C158]'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Quick Share CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Share Directly on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfile(null);
                        setUserName('');
                      }}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#DFCEBC] text-xs transition-colors cursor-pointer"
                    >
                      Reset / Switch User
                    </button>
                  </div>
                </div>
              )}

              {/* 3-Step Flow Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h5 className="font-bold text-white text-xs">Share Your Link</h5>
                  <p className="text-[11px] text-[#DFCEBC]">
                    Send your personalized link to friends, sisters, or colleagues looking for elite styling.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h5 className="font-bold text-white text-xs">Friend Books</h5>
                  <p className="text-[11px] text-[#DFCEBC]">
                    When your friend completes an appointment booking via your link, rewards trigger immediately.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">Both Get 25% Off</h5>
                  <p className="text-[11px] text-[#DFCEBC]">
                    Both of you receive a discount code strictly for our most expensive wig, active for 3 days!
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* REWARDS VIEW: MY UNLOCKED DISCOUNT CODES */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif-luxury text-base font-bold text-white">
                    Your Unlocked Wig Discount Codes
                  </h4>
                  <p className="text-xs text-[#DFCEBC]">
                    Generated from your successful friend referrals and welcome invitations.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#F5E6A3] border border-[#D4AF37]/30">
                  {rewards.length} Total Code{rewards.length !== 1 ? 's' : ''}
                </span>
              </div>

              {rewards.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#DFCEBC]">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-white text-sm">No Active Discount Codes Yet</h5>
                  <p className="text-xs text-[#DFCEBC] max-w-sm mx-auto">
                    Share your unique referral link! As soon as a friend completes an appointment booking, both of your 3-day discount codes will appear right here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('invite')}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#2A170C] text-xs font-bold hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    Generate & Share Link Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => {
                    const time = getTimeRemaining(reward.expiresAt);
                    const isUsable = !reward.isUsed && !time.isExpired;

                    return (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          reward.isUsed
                            ? 'bg-black/30 border-white/10 opacity-70'
                            : time.isExpired
                            ? 'bg-red-950/20 border-red-900/40 opacity-80'
                            : 'bg-gradient-to-r from-[#2A170C] to-[#1F1008] border-[#D4AF37]/60 shadow-md'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isUsable
                                  ? 'bg-[#D4AF37] text-[#2A170C]'
                                  : 'bg-white/10 text-[#DFCEBC]'
                              }`}
                            >
                              <Percent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                                  {reward.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(reward.code)}
                                  className="text-[#D4AF37] hover:text-[#F5E6A3] p-1 rounded-sm cursor-pointer"
                                  title="Copy Code"
                                >
                                  {copiedCode === reward.code ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-[#DFCEBC]">
                                {reward.recipientType === 'new_client'
                                  ? '🎁 Welcome Client Reward'
                                  : '👑 Referrer Royalty Reward'}
                                {reward.referrerName ? ` • Invited by ${reward.referrerName}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Expiry / Status Badge */}
                          <div>
                            {reward.isUsed ? (
                              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[#DFCEBC] text-[10px] font-semibold">
                                Redeemed
                              </span>
                            ) : time.isExpired ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-800/40 text-[10px] font-semibold">
                                Expired (3-Day Limit Passed)
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Expires in: {time.formatted}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Strict Details */}
                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-[#DFCEBC]/70 block">
                              Strictly Applicable Product:
                            </span>
                            <span className="font-semibold text-white">
                              {reward.targetProductName}
                            </span>
                            <span className="block text-emerald-400 text-[11px] font-semibold">
                              {reward.discountPercentage}% Discount • Save ₦{reward.discountAmount.toLocaleString()}
                            </span>
                          </div>

                          {isUsable && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                if (onNavigateToShopWithWig) {
                                  onNavigateToShopWithWig(reward.targetProductId, reward.code);
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A170C] font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Redeem on Wig in Shop Now</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#120904] border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#DFCEBC]/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Official RossyBraids Referral System • 08137989405</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#DFCEBC] hover:text-white transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
