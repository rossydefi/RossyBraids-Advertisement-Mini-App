import React, { useState } from 'react';
import { AppointmentBooking, MaintenanceScheduleInfo } from '../types';
import {
  calculateMaintenanceStatus,
  generateMaintenanceWhatsAppUrl,
  getLatestAppointmentsByType,
  getSamplePastAppointments,
} from '../utils/maintenance';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Building2,
  Home,
  Sliders,
  Info,
  Pin,
  Flame,
  Award,
} from 'lucide-react';

interface AppointmentHistoryProps {
  bookings: AppointmentBooking[];
  onScheduleMaintenance: (
    serviceId: string,
    notes?: string,
    clientName?: string,
    clientPhone?: string,
    pinnedSubtype?: string
  ) => void;
  onUpdateBookings: (updated: AppointmentBooking[]) => void;
  onSwitchToBookingTab: () => void;
}

export const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({
  bookings,
  onScheduleMaintenance,
  onUpdateBookings,
  onSwitchToBookingTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'due' | 'scheduled' | 'fresh'>('all');
  const [customTestDate, setCustomTestDate] = useState<string>(() => {
    // Default to 29 days ago for quick testing
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
  });
  const [showTestPanel, setShowTestPanel] = useState<boolean>(false);

  // Group latest appointment by service type
  const latestByType = getLatestAppointmentsByType(bookings);

  // Collect all maintenance infos
  const maintenanceList: { booking: AppointmentBooking; maintenance: MaintenanceScheduleInfo }[] =
    Array.from(latestByType.values());

  // Count how many are due (4+ weeks elapsed and not dismissed)
  const dueCount = maintenanceList.filter(
    (item) =>
      item.maintenance.isDue &&
      !item.booking.isMaintenanceScheduled &&
      !item.booking.maintenanceDismissed
  ).length;

  const handleMarkScheduled = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            isMaintenanceScheduled: true,
            lastMaintenanceScheduledDate: new Date().toISOString(),
          }
        : b
    );
    onUpdateBookings(updated);
  };

  const handleDismissNotification = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, maintenanceDismissed: true } : b
    );
    onUpdateBookings(updated);
  };

  const handleResetDismissed = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            maintenanceDismissed: false,
            isMaintenanceScheduled: false,
          }
        : b
    );
    onUpdateBookings(updated);
  };

  const handleLoadSampleData = () => {
    const samples = getSamplePastAppointments();
    // Merge or replace
    const merged = [...samples, ...bookings.filter((b) => !samples.some((s) => s.id === b.id))];
    onUpdateBookings(merged);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your appointment history?')) {
      onUpdateBookings([]);
    }
  };

  const handleAddTestAppointment = (serviceId: string, serviceName: string) => {
    const newBooking: AppointmentBooking = {
      id: `RB-TEST-${Date.now().toString().slice(-4)}`,
      serviceId,
      serviceName,
      stylist: 'Rose Iyaji (Master Artisan)',
      date: customTestDate,
      timeSlot: '10:00 AM',
      clientName: 'Demo Client',
      clientPhone: '08137989405',
      locationType: 'salon',
      addOns: ['Scalp Moisture Treatment'],
      totalPrice: 22000,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      notes: `Test booking simulated for date: ${customTestDate}`,
    };

    onUpdateBookings([newBooking, ...bookings]);
  };

  // Filter items
  const filteredBookings = bookings.filter((b) => {
    const m = calculateMaintenanceStatus(b);
    if (filter === 'due') return m.isDue && !b.isMaintenanceScheduled;
    if (filter === 'scheduled') return b.isMaintenanceScheduled;
    if (filter === 'fresh') return !m.isDue;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in text-[#2D1B11]">
      {/* Header section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8F6A1E] text-xs font-sans-modern font-semibold uppercase tracking-widest">
          <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
          Smart Hair Journey & Automated Maintenance
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#2D1B11] tracking-tight">
          Your Appointment History & Maintenance Hub
        </h1>
        <p className="font-sans-modern text-sm text-[#6C4A32] max-w-2xl mx-auto">
          We automatically track the 4-week lifespan of your hairstyle. When your locs, braids, wigs, or
          traditional styles reach 4 weeks, an automated maintenance visit prompt is triggered right here
          to preserve root health and prevent hairline tension.
        </p>
      </div>

      {/* Top Banner: Automated 4-Week Maintenance Alerts (Active if any are due) */}
      {dueCount > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#2D1B11] via-[#3E2415] to-[#2D1B11] text-white border-2 border-[#D4AF37] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#2D1B11] flex items-center justify-center shrink-0 animate-pulse">
                <Bell className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-sans-modern font-bold">
                  Automated Maintenance System Prompt
                </span>
                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#F9E498]">
                  {dueCount} Style Maintenance Visit{dueCount > 1 ? 's' : ''} Recommended Now
                </h3>
              </div>
            </div>
            <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F9E498] font-sans-modern font-semibold">
              4-Week Cycle Reached
            </span>
          </div>

          <p className="text-xs text-[#DFCEBC] font-sans-modern leading-relaxed">
            The American & African Trichology guidelines recommend professional scalp detoxing, perimeter
            re-braiding, or loc retwisting every <strong>4 weeks (28 days)</strong> to prevent follicle
            breakage, root tangling, or lace adhesive damage. Review your scheduled maintenance below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {maintenanceList
              .filter(
                (item) =>
                  item.maintenance.isDue &&
                  !item.booking.isMaintenanceScheduled &&
                  !item.booking.maintenanceDismissed
              )
              .map(({ booking, maintenance }) => (
                <div
                  key={booking.id}
                  className="bg-black/40 border border-[#D4AF37]/50 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#D4AF37] uppercase font-sans-modern font-bold tracking-wider block">
                          Last Visited: {maintenance.formattedOriginalDate} ({maintenance.daysElapsed} days ago)
                        </span>
                        <h4 className="font-serif-luxury text-base font-bold text-white leading-tight">
                          {booking.serviceName}
                        </h4>
                        {booking.selectedSubtype && (
                          <span className="text-xs text-[#DFCEBC] font-sans-modern block">
                            Type: {booking.selectedSubtype}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase shrink-0">
                        {maintenance.daysElapsed - maintenance.cycleDays === 0
                          ? 'Due Today'
                          : `+${maintenance.daysElapsed - maintenance.cycleDays}d Past 4 Wks`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-sans-modern space-y-1">
                      <div className="text-[#F9E498] font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Recommended: {maintenance.recommendedActionTitle}</span>
                      </div>
                      <p className="text-[11px] text-[#DFCEBC] leading-relaxed">
                        {maintenance.hairCareGuidance}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#DFCEBC] font-sans-modern">
                      <span>Suggested Add-on:</span>
                      <strong className="text-[#F9E498]">{maintenance.recommendedAddOn}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onScheduleMaintenance(
                          maintenance.recommendedServiceId,
                          `4-Week Automated Maintenance for previous booking ${booking.id} (${booking.serviceName}). Client requested ${maintenance.recommendedActionTitle}.`,
                          booking.clientName,
                          booking.clientPhone,
                          booking.selectedSubtype
                        );
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2D1B11] text-xs font-sans-modern font-bold hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Maintenance Visit</span>
                    </button>

                    <a
                      href={generateMaintenanceWhatsAppUrl(booking, maintenance)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] text-xs font-sans-modern font-bold hover:bg-[#25D366]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Direct 4-Week Maintenance on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleMarkScheduled(booking.id)}
                      className="py-2 px-2.5 rounded-lg bg-white/10 text-[#DFCEBC] text-[11px] font-sans-modern hover:text-white hover:bg-white/20 transition-all cursor-pointer text-center"
                      title="Mark as already scheduled or taken care of"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#DFCEBC] shadow-sm p-5 sm:p-6 space-y-6">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFCEBC]/60">
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#2D1B11] flex items-center gap-2">
              <span>Appointment History & Lifecycle Tracker</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#8F6A1E] font-sans-modern font-bold">
                {bookings.length} Record{bookings.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <p className="text-xs text-[#6C4A32] font-sans-modern mt-0.5">
              Every hairstyle has a calculated 4-week timeline with automatic status reminders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 rounded-lg bg-[#F5EFEB] border border-[#DFCEBC]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-sans-modern transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#2D1B11] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-[#6C4A32] hover:text-[#2D1B11]'
                }`}
              >
                All ({bookings.length})
              </button>

              <button
                type="button"
                onClick={() => setFilter('due')}
                className={`px-2.5 py-1 rounded text-xs font-sans-modern transition-all cursor-pointer flex items-center gap-1 ${
                  filter === 'due'
                    ? 'bg-[#B84E1A] text-white font-bold shadow-xs'
                    : 'text-[#6C4A32] hover:text-[#B84E1A]'
                }`}
              >
                <span>4-Wk Due</span>
                {dueCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                    {dueCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilter('fresh')}
                className={`px-2.5 py-1 rounded text-xs font-sans-modern transition-all cursor-pointer ${
                  filter === 'fresh'
                    ? 'bg-[#2D1B11] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-[#6C4A32] hover:text-[#2D1B11]'
                }`}
              >
                Active Styles
              </button>

              <button
                type="button"
                onClick={() => setFilter('scheduled')}
                className={`px-2.5 py-1 rounded text-xs font-sans-modern transition-all cursor-pointer ${
                  filter === 'scheduled'
                    ? 'bg-[#2D1B11] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-[#6C4A32] hover:text-[#2D1B11]'
                }`}
              >
                Maintained
              </button>
            </div>

            {/* Book new appointment action */}
            <button
              type="button"
              onClick={onSwitchToBookingTab}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#2D1B11] text-xs font-sans-modern font-bold hover:bg-[#E5C158] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* If no bookings exist */}
        {bookings.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-[#FAF7F2] border-2 border-dashed border-[#DFCEBC] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 text-[#8F6A1E] flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif-luxury text-lg font-bold text-[#2D1B11]">
                No Appointments Recorded Yet
              </h3>
              <p className="text-xs text-[#6C4A32] font-sans-modern">
                Once you confirm an appointment, your hair history and automated 4-week maintenance alerts
                will be tracked here. You can also load sample data to see the 4-week prompt in action immediately.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onSwitchToBookingTab}
                className="px-4 py-2 rounded-lg bg-[#2D1B11] text-[#F9E498] text-xs font-sans-modern font-bold hover:bg-[#3D2517] transition-all cursor-pointer"
              >
                Schedule First Appointment
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="px-4 py-2 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] text-[#8F6A1E] text-xs font-sans-modern font-bold hover:bg-[#D4AF37]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Load Sample Bookings (Test 4-Week Alert)</span>
              </button>
            </div>
          </div>
        ) : (
          /* List of Bookings */
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#6C4A32] font-sans-modern">
                No appointments match this filter.
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const maintenance = calculateMaintenanceStatus(booking);
                const isOverdue = maintenance.isDue;
                const cycleDays = maintenance.cycleDays; // 28
                const daysElapsed = Math.max(0, maintenance.daysElapsed);
                const progressPct = Math.min(100, Math.round((daysElapsed / cycleDays) * 100));

                return (
                  <div
                    key={booking.id}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOverdue && !booking.isMaintenanceScheduled
                        ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF9] to-[#FBF6EE] shadow-md ring-1 ring-[#D4AF37]/40'
                        : 'border-[#DFCEBC] bg-white hover:border-[#D4AF37]/60'
                    }`}
                  >
                    {/* Card Top: Service Name, Date, Stylist, Status */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#8F6A1E] bg-[#D4AF37]/15 px-2 py-0.5 rounded">
                              Ref: {booking.id}
                            </span>
                            <span className="text-xs text-[#6C4A32] font-sans-modern">
                              Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {booking.locationType === 'home_service' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#8F6A1E]/15 text-[#8F6A1E] font-sans-modern font-semibold">
                                <Home className="w-3 h-3" /> VIP Home Service
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#DFCEBC]/50 text-[#6C4A32] font-sans-modern">
                                <Building2 className="w-3 h-3" /> Salon Visit
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#2D1B11]">
                            {booking.serviceName}
                          </h3>

                          {booking.selectedSubtype && (
                            <p className="text-xs font-semibold text-[#8F6A1E] font-sans-modern flex items-center gap-1">
                              <Pin className="w-3 h-3 fill-current" />
                              <span>Pinned: {booking.selectedSubtype}</span>
                            </p>
                          )}
                        </div>

                        {/* 4-Week Maintenance Status Badge */}
                        <div className="sm:text-right shrink-0">
                          {booking.isMaintenanceScheduled ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-sans-modern border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Maintenance Handled
                            </span>
                          ) : isOverdue ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-sans-modern border border-amber-300 animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> 4-Week Maintenance Due
                              </span>
                              <span className="block text-[11px] font-sans-modern text-[#B84E1A] font-semibold">
                                {daysElapsed} days since appointment
                              </span>
                            </div>
                          ) : maintenance.urgency === 'approaching' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold font-sans-modern border border-amber-200">
                                <Clock className="w-3.5 h-3.5" /> Due in {maintenance.daysUntilDue} day{maintenance.daysUntilDue !== 1 ? 's' : ''}
                              </span>
                              <span className="block text-[11px] font-sans-modern text-[#6C4A32]">
                                Day {daysElapsed} of 28
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-800 text-xs font-semibold font-sans-modern border border-green-200">
                                <Sparkles className="w-3.5 h-3.5" /> Active Fresh Style
                              </span>
                              <span className="block text-[11px] font-sans-modern text-[#6C4A32]">
                                Day {daysElapsed} of 28
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details row: Date, Stylist, Price */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#DFCEBC]/40 text-xs font-sans-modern">
                        <div>
                          <span className="text-[#8C6D53] block text-[11px]">Appointment Date:</span>
                          <strong className="text-[#2D1B11]">{maintenance.formattedOriginalDate}</strong>
                        </div>
                        <div>
                          <span className="text-[#8C6D53] block text-[11px]">Time Slot & Stylist:</span>
                          <strong className="text-[#2D1B11]">
                            {booking.timeSlot} • {booking.stylist.split('(')[0]}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#8C6D53] block text-[11px]">Client Contact:</span>
                          <strong className="text-[#2D1B11] truncate block">
                            {booking.clientName} ({booking.clientPhone})
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#8C6D53] block text-[11px]">Investment Paid:</span>
                          <strong className="text-[#8F6A1E] font-bold text-sm">
                            ₦{booking.totalPrice.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* 4-Week Maintenance Timeline Progress Bar */}
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-sans-modern">
                          <span className="text-[#6C4A32] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8F6A1E]" />
                            <strong>4-Week (28-Day) Maintenance Cycle Tracker</strong>
                          </span>
                          <span className="font-semibold text-[#8F6A1E]">
                            {isOverdue
                              ? `100% (Overdue by ${daysElapsed - 28} day${daysElapsed - 28 === 1 ? '' : 's'})`
                              : `${progressPct}% (${maintenance.daysUntilDue} days until 4-week mark)`}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-[#EAE1D7] overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverdue
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B84E1A]'
                                : progressPct >= 75
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158]'
                                : 'bg-[#D4AF37]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-[#8C6D53] font-sans-modern">
                          <span>Day 1 (Installation)</span>
                          <span>Day 14 (Mid-Wear)</span>
                          <span className="font-bold text-[#8F6A1E]">Day 28 (Touch-up Due: {maintenance.formattedDueDate})</span>
                        </div>
                      </div>

                      {/* Specific Maintenance Callout if Due or Approaching */}
                      {(isOverdue || maintenance.urgency === 'approaching') && !booking.isMaintenanceScheduled && (
                        <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#D4AF37]/50 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D1B11] font-serif-luxury">
                              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                              <span>Recommended 4-Week Care: {maintenance.recommendedActionTitle}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8F6A1E] font-bold uppercase font-sans-modern">
                              Trichology Standard
                            </span>
                          </div>

                          <p className="text-xs text-[#6C4A32] font-sans-modern leading-relaxed">
                            {maintenance.hairCareGuidance}
                          </p>

                          <div className="flex items-center justify-between text-xs text-[#8F6A1E] font-sans-modern font-semibold pt-1">
                            <span>Recommended Add-on: {maintenance.recommendedAddOn}</span>
                            <span>{maintenance.benefitSummary}</span>
                          </div>
                        </div>
                      )}

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-[#DFCEBC]/40 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Schedule 4-Week Maintenance CTA */}
                          <button
                            type="button"
                            onClick={() => {
                              onScheduleMaintenance(
                                maintenance.recommendedServiceId,
                                `4-Week Maintenance Visit following previous booking #${booking.id} (${booking.serviceName}). Client requested ${maintenance.recommendedActionTitle}.`,
                                booking.clientName,
                                booking.clientPhone,
                                booking.selectedSubtype
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#2D1B11] text-[#F9E498] hover:bg-[#3E2415] text-xs font-sans-modern font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Schedule Maintenance Visit</span>
                          </button>

                          {/* Quick WhatsApp Maintenance Link */}
                          <a
                            href={generateMaintenanceWhatsAppUrl(booking, maintenance)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#1E7E34] text-xs font-sans-modern font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                            <span>Chat on WhatsApp</span>
                          </a>
                        </div>

                        {/* Status Toggles */}
                        <div className="flex items-center gap-2">
                          {booking.isMaintenanceScheduled ? (
                            <button
                              type="button"
                              onClick={() => handleResetDismissed(booking.id)}
                              className="text-[11px] text-[#8C6D53] hover:text-[#2D1B11] underline font-sans-modern cursor-pointer"
                            >
                              Reset Maintenance Status
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkScheduled(booking.id)}
                              className="px-2.5 py-1 rounded-md border border-[#DFCEBC] hover:border-[#D4AF37] text-[11px] text-[#6C4A32] hover:text-[#2D1B11] font-sans-modern cursor-pointer"
                              title="Mark this 4-week maintenance as completed"
                            >
                              Mark as Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer Actions: Test Panel & Samples */}
        <div className="pt-4 border-t border-[#DFCEBC]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans-modern">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-[#8F6A1E] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset / Reload Sample Appointments</span>
            </button>

            <span className="text-[#DFCEBC]">•</span>

            <button
              type="button"
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="text-[#6C4A32] hover:text-[#2D1B11] flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showTestPanel ? 'Hide Date Simulator' : 'Simulate Custom 4-Week Date'}</span>
            </button>
          </div>

          {bookings.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Simulated Date Tester Drawer */}
        {showTestPanel && (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/50 space-y-3 animate-fade-in text-xs font-sans-modern">
            <div className="flex items-center gap-2 font-bold text-[#2D1B11] font-serif-luxury">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <span>Simulate Past Appointment Date (Test 4-Week Automated Prompt)</span>
            </div>
            <p className="text-[#6C4A32]">
              Set an appointment date to 28+ days ago to immediately verify how the automated notification
              system triggers and prompts the user to schedule their 4-week maintenance visit:
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={customTestDate}
                onChange={(e) => setCustomTestDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#DFCEBC] bg-white text-xs text-[#2D1B11]"
              />

              <button
                type="button"
                onClick={() => handleAddTestAppointment('dreadlocks', 'Dreadlocks & Reloc')}
                className="px-3 py-1.5 rounded-lg bg-[#2D1B11] text-[#F9E498] font-bold hover:bg-[#3D2517] cursor-pointer"
              >
                + Add Simulated Dreadlocks (4 Wks Ago)
              </button>

              <button
                type="button"
                onClick={() => handleAddTestAppointment('boho-braids', 'Boho Braids & Island Curls')}
                className="px-3 py-1.5 rounded-lg bg-[#2D1B11] text-[#F9E498] font-bold hover:bg-[#3D2517] cursor-pointer"
              >
                + Add Simulated Boho Braids (4 Wks Ago)
              </button>

              <button
                type="button"
                onClick={() => handleAddTestAppointment('wigs-revamping', 'Bone-Straight Wigs & Revamping')}
                className="px-3 py-1.5 rounded-lg bg-[#2D1B11] text-[#F9E498] font-bold hover:bg-[#3D2517] cursor-pointer"
              >
                + Add Simulated Wig Install (4 Wks Ago)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Educational Hair Care Maintenance Philosophy */}
      <div className="p-5 rounded-xl bg-[#F5EFEB] border border-[#DFCEBC] space-y-2 text-xs font-sans-modern text-[#6C4A32]">
        <div className="flex items-center gap-2 text-[#2D1B11] font-bold font-serif-luxury text-sm">
          <Award className="w-4 h-4 text-[#D4AF37]" />
          <span>Why RossyBraids Mandates 4-Week Maintenance</span>
        </div>
        <p className="leading-relaxed">
          Protective styles and artisan braiding look best and protect the scalp when maintained on a regular 4-week rhythm.
          Waiting longer than 4-6 weeks without root retwisting or edge perimeter refreshing increases the risk of traction thinning,
          matting, and product buildup. Our automated notification system ensures you never miss your optimal window.
        </p>
      </div>
    </div>
  );
};
