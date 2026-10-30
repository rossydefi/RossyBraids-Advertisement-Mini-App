import { config } from './config';

/** SMS through Termii when TERMII_API_KEY is set; otherwise the message is only logged. */
export async function sendSms(phone: string, message: string): Promise<boolean> {
  if (!config.termiiKey) {
    console.log(`[sms:not-configured] to ${phone}: ${message}`);
    return false;
  }
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        from: config.termiiSender,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: config.termiiKey,
      }),
    });
    if (!res.ok) console.error('[sms] Termii responded', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('[sms] failed', err);
    return false;
  }
}

export function notifyOwner(message: string): void {
  console.log(`[owner] ${message}`);
  if (config.ownerPhone) void sendSms(config.ownerPhone, message);
}
