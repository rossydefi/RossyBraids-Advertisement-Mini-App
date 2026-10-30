import { all, run } from './db';
import { sendSms } from './notify';
import { config } from './config';
import { lagosToday } from './util';
import { maintenanceDue } from './admin';

/** Hourly job: SMS reminders the day before, and a nudge when the 4-week maintenance visit is due. Needs Termii. */
async function tick() {
  const tomorrow = new Date(Date.parse(`${lagosToday()}T00:00:00Z`) + 86400_000).toISOString().slice(0, 10);
  const due = all<any>("SELECT * FROM bookings WHERE date = ? AND status IN ('pending','confirmed') AND reminded_at IS NULL", tomorrow);
  for (const b of due) {
    const ok = await sendSms(b.client_phone, `Hi ${b.client_name}, a reminder of your RossyBraids appointment tomorrow, ${b.time_slot}. Reply on WhatsApp if you need to reschedule.`);
    if (ok) run('UPDATE bookings SET reminded_at = ? WHERE id = ?', new Date().toISOString(), b.id);
  }

  for (const { booking, maintenance } of maintenanceDue()) {
    if (!maintenance.isDue || (booking as any).maintenanceReminderSent) continue;
    const ok = await sendSms(String(booking.clientPhone), `Hi ${booking.clientName}, your ${booking.serviceName} is due for its 4-week refresh: ${maintenance.recommendedActionTitle}. Book at ${config.appUrl}/booking`);
    if (ok) {
      const row = all<any>('SELECT data FROM bookings WHERE id = ?', booking.id)[0];
      run('UPDATE bookings SET data = ? WHERE id = ?', JSON.stringify({ ...JSON.parse(row.data), maintenanceReminderSent: true }), booking.id);
    }
  }
}

export function startReminderJob() {
  if (!config.termiiKey) return;
  const safeTick = () => tick().catch((err) => console.error('[reminders]', err));
  setTimeout(safeTick, 30_000);
  setInterval(safeTick, 60 * 60_000).unref();
}
