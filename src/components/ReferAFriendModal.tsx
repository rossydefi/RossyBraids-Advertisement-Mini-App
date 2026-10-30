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
import { ReferralProfile } from '../types';
import {
  clearReferralProfile,
  getMostExpensiveWig,
  getReferralShareUrl,
  getStoredReferralProfile,
  saveReferralProfile,
  getTimeRemaining,
} from '../utils/referral';
import { PRODUCTS_SHOP_DATA } from '../data/flyerData';
import { api, applyProductOverrides, ApiError, type RewardView } from '../api/client';
import { useSite } from '../api/SiteProvider';
import { useModalA11y } from '../hooks/useModalA11y';

interface ReferAFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShopWithWig?: (wigId: string, discountCode?: string) => void;
  /** Alias of onNavigateToShopWithWig, as passed by App. */
  onNavigateToShop?: (wigId: string, discountCode?: string) => void;
  onNavigateToBooking?: () => void;
}

export const ReferAFriendModal: React.FC<ReferAFriendModalProps> = ({
  isOpen,
  onClose,
  onNavigateToShopWithWig,
  onNavigateToShop,
}) => {
  const { config, sessionToken, sessionPhone, signIn } = useSite();
  const dialogRef = useModalA11y(isOpen, onClose);
  const goToShop = onNavigateToShopWithWig ?? onNavigateToShop;

  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'invite' | 'rewards'>('invite');
  const [rewards, setRewards] = useState<RewardView[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState<boolean>(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Sign-in (phone OTP) so a referrer can see the reward issued to their number
  const [otpPhone, setOtpPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState<boolean>(false);

  // Dynamically evaluate the current most expensive wig (including admin price changes)
  const mostExpensiveWig = getMostExpensiveWig(applyProductOverrides(PRODUCTS_SHOP_DATA, config));
  const discountSavings = Math.round(mostExpensiveWig.price * 0.25);
  const discountedPrice = mostExpensiveWig.price - discountSavings;

  useEffect(() => {
    if (!isOpen) return;
    const existingProfile = getStoredReferralProfile();
    if (!existingProfile) return;
    setProfile(existingProfile);
    setUserName(existingProfile.referrerName);
    if (existingProfile.referrerPhone) {
      setUserPhone(existingProfile.referrerPhone);
      setOtpPhone((p) => p || existingProfile.referrerPhone!);
      // Refresh the referral count from the server; the cached copy is only a convenience.
      api
        .referralProfile(existingProfile.referrerName, existingProfile.referrerPhone)
        .then((fresh) => {
          const updated: ReferralProfile = {
            ...existingProfile,
            referralCode: fresh.referralCode,
            totalReferrals: fresh.totalReferrals,
            successfulBookings: fresh.totalReferrals,
          };
          saveReferralProfile(updated);
          setProfile(updated);
        })
        .catch(() => undefined);
    }
  }, [isOpen]);

  // Load the signed-in client's rewards whenever the rewards tab is shown
  useEffect(() => {
    if (!isOpen || activeSubView !== 'rewards' || !sessionToken) return;
    let cancelled = false;
    setRewardsLoading(true);
    setRewardsError(null);
    api
      .myRewards(sessionToken)
      .then((list) => !cancelled && setRewards(list))
      .catch((err) => !cancelled && setRewardsError(err instanceof ApiError ? err.message : 'Could not load your rewards.'))
      .finally(() => !cancelled && setRewardsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeSubView, sessionToken]);

  // Re-render every second so live reward countdowns tick
  useEffect(() => {
    if (!isOpen || activeSubView !== 'rewards') return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeSubView]);

  if (!isOpen) return null;

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim()) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await api.referralProfile(userName.trim(), userPhone.trim());
      const newProfile: ReferralProfile = {
        referralCode: result.referralCode,
        referrerName: result.referrerName,
        referrerPhone: userPhone.trim(),
        createdAt: result.createdAt,
        totalReferrals: result.totalReferrals,
        successfulBookings: result.totalReferrals,
      };
      saveReferralProfile(newProfile);
      setProfile(newProfile);
      setOtpPhone((p) => p || userPhone.trim());
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpBusy(true);
    setOtpError(null);
    try {
      const res = await api.requestOtp(otpPhone.trim());
      setDevCode(res.devCode ?? null);
      setOtpStep('code');
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Could not send a code. Please try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpBusy(true);
    setOtpError(null);
    try {
      const res = await api.verifyOtp(otpPhone.trim(), otpCode.trim());
      signIn(res.token, res.phone);
      setOtpCode('');
      setOtpStep('phone');
      setDevCode(null);
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Could not verify the code. Please try again.');
    } finally {
      setOtpBusy(false);
    }
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

🎁 When your booking is confirmed, we BOTH unlock an exclusive 25% discount code for the salon's MOST EXPENSIVE luxury wig (${mostExpensiveWig.name})! The code is valid for 72 hours once unlocked, so don't miss it! 👑💖`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="refer-a-friend-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="refer-modal-title"
        className="relative w-full max-w-2xl bg-[#1A0F08] border border-[#D4AF37]/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#FAF6F0] focus:outline-none"
      >
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
              <h3 id="refer-modal-title" className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                Refer a Friend & Earn Flagship Wig Discounts
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCEBC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close referral dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Toggle: Generate / Share Link vs My Unlocked Codes */}
        <div role="tablist" aria-label="Referral sections" className="px-5 pt-3 pb-1 border-b border-[#D4AF37]/15 bg-[#140B05] flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubView === 'invite'}
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
            role="tab"
            aria-selected={activeSubView === 'rewards'}
            onClick={() => setActiveSubView('rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-sans-modern font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeSubView === 'rewards'
                ? 'bg-[#D4AF37] text-[#2A170C] shadow-sm'
                : 'text-[#DFCEBC] hover:bg-white/5'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>My Wig Discount Codes</span>
            {rewards.some((r) => r.state === 'active') && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-label="You have an active reward" />
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
                  1. The discount code is <strong>strictly valid for the most expensive wig</strong> in our salon collection.
                  <br />
                  2. Codes unlock once the salon <strong>confirms the new client's booking</strong>, and then <strong>expire after three (3) days (72 hours)</strong>.
                  <br />
                  3. Referral rewards are for first-time clients, and each code can be used once.
                </div>
              </div>

              {/* Profile / Link Generation */}
              {!profile ? (
                <form onSubmit={handleGenerateLink} className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/5" noValidate={false}>
                  <div className="space-y-1">
                    <h4 className="font-serif-luxury text-sm font-bold text-[#F5E6A3]">
                      Step 1: Create Your Unique Referral Link
                    </h4>
                    <p className="text-xs text-[#DFCEBC]">
                      Enter your name and WhatsApp number to get your personal RossyBraids VIP referral link. Your number is how we match rewards to you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="refer-name" className="block text-[11px] font-semibold text-[#DFCEBC] mb-1">
                        Your Name *
                      </label>
                      <input
                        id="refer-name"
                        type="text"
                        required
                        placeholder="e.g. Chidinma Okafor"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="refer-phone" className="block text-[11px] font-semibold text-[#DFCEBC] mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        id="refer-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="e.g. 08123456789"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <p role="alert" aria-live="polite" className={formError ? 'text-xs text-red-300' : 'sr-only'}>
                    {formError}
                  </p>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text-[#2A170C] font-bold text-xs hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-wait"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>{busy ? 'Creating your link…' : 'Get My Referral Link'}</span>
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
                        Friends Referred
                      </span>
                      <span className="font-cinzel text-base font-bold text-white">
                        {profile.totalReferrals}
                      </span>
                    </div>
                  </div>

                  {/* Shareable Link Box */}
                  <div className="space-y-1.5">
                    <label htmlFor="refer-link" className="text-[11px] text-[#DFCEBC] font-semibold flex items-center justify-between">
                      <span>Your Unique Referral Link:</span>
                      <span className="text-[10px] text-[#D4AF37]">Copy & share</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="refer-link"
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
                        clearReferralProfile();
                        setProfile(null);
                        setUserName('');
                        setUserPhone('');
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
                    When your friend books through your link, a reward is reserved for each of you.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">Both Get 25% Off</h5>
                  <p className="text-[11px] text-[#DFCEBC]">
                    Once the salon confirms the booking, both of you unlock a code for our most expensive wig, active for 3 days!
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* REWARDS VIEW: MY DISCOUNT CODES (issued and verified by the salon's server) */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif-luxury text-base font-bold text-white">
                    Your Wig Discount Codes
                  </h4>
                  <p className="text-xs text-[#DFCEBC]">
                    Codes from your referrals and welcome invitations, tied to your phone number.
                  </p>
                </div>
                {sessionToken && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#F5E6A3] border border-[#D4AF37]/30 shrink-0">
                    {rewards.length} Total Code{rewards.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {!sessionToken ? (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <h5 className="font-bold text-white text-sm">Sign in with your phone number</h5>
                  <p className="text-xs text-[#DFCEBC]">
                    We'll text you a 6-digit code so only you can see your rewards.
                  </p>

                  {otpStep === 'phone' ? (
                    <form onSubmit={handleRequestOtp} className="flex flex-col sm:flex-row gap-2">
                      <label htmlFor="otp-phone" className="sr-only">Phone number</label>
                      <input
                        id="otp-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="e.g. 08123456789"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none text-xs"
                      />
                      <button
                        type="submit"
                        disabled={otpBusy}
                        className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#2A170C] text-xs font-bold hover:bg-[#E5C158] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        {otpBusy ? 'Sending…' : 'Text me a code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label htmlFor="otp-code" className="sr-only">6-digit code</label>
                        <input
                          id="otp-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          required
                          maxLength={6}
                          placeholder="6-digit code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none text-xs font-mono tracking-widest"
                        />
                        <button
                          type="submit"
                          disabled={otpBusy || otpCode.length !== 6}
                          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#2A170C] text-xs font-bold hover:bg-[#E5C158] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {otpBusy ? 'Checking…' : 'Verify & view rewards'}
                        </button>
                      </div>
                      {devCode && (
                        <p className="text-[11px] text-amber-300">
                          Dev mode (no SMS provider configured): your code is <span className="font-mono font-bold">{devCode}</span>
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setOtpCode('');
                          setDevCode(null);
                          setOtpError(null);
                        }}
                        className="text-[11px] text-[#DFCEBC] underline cursor-pointer"
                      >
                        Use a different number
                      </button>
                    </form>
                  )}

                  <p role="alert" aria-live="polite" className={otpError ? 'text-xs text-red-300' : 'sr-only'}>
                    {otpError}
                  </p>
                </div>
              ) : rewardsLoading ? (
                <p role="status" className="py-8 text-center text-xs text-[#DFCEBC]">Loading your rewards…</p>
              ) : rewardsError ? (
                <p role="alert" className="py-4 text-center text-xs text-red-300">{rewardsError}</p>
              ) : rewards.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#DFCEBC]">
                    <Tag className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h5 className="font-bold text-white text-sm">No Discount Codes Yet</h5>
                  {sessionPhone && (
                    <p className="text-[11px] text-[#DFCEBC]/70">Signed in as {sessionPhone}</p>
                  )}
                  <p className="text-xs text-[#DFCEBC] max-w-sm mx-auto">
                    Share your unique referral link! Once a friend's first booking is confirmed by the salon, both of your 3-day codes will appear right here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('invite')}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#2A170C] text-xs font-bold hover:bg-[#E5C158] transition-colors cursor-pointer"
                  >
                    Get &amp; Share My Link
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => {
                    const time = reward.expiresAt ? getTimeRemaining(reward.expiresAt) : null;
                    // The server's state is authoritative; also notice expiry between refreshes.
                    const state = reward.state === 'active' && time?.isExpired ? 'expired' : reward.state;
                    const isUsable = state === 'active';

                    return (
                      <div
                        key={reward.code}
                        className={`p-4 rounded-2xl border transition-all ${
                          state === 'used'
                            ? 'bg-black/30 border-white/10 opacity-70'
                            : state === 'expired'
                            ? 'bg-red-950/20 border-red-900/40 opacity-80'
                            : state === 'awaiting_confirmation'
                            ? 'bg-black/30 border-amber-500/30'
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
                              <Percent className="w-4 h-4" aria-hidden="true" />
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
                                  aria-label={`Copy code ${reward.code}`}
                                >
                                  {copiedCode === reward.code ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-[#DFCEBC]">
                                {reward.recipientType === 'new_client'
                                  ? '🎁 Welcome Client Reward'
                                  : '👑 Referrer Royalty Reward'}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {state === 'used' ? (
                              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[#DFCEBC] text-[10px] font-semibold">
                                Redeemed
                              </span>
                            ) : state === 'expired' ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-800/40 text-[10px] font-semibold">
                                Expired (3-Day Limit Passed)
                              </span>
                            ) : state === 'awaiting_confirmation' ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                                Unlocks when the salon confirms the booking
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Expires in: {time?.formatted}</span>
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
                              {reward.productName}
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
                                goToShop?.(reward.productId, reward.code);
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A170C] font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
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
            <span>Official RossyBraids Referral System</span>
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
