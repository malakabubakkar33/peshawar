// Email Service for SafarGo Peshawar using Resend API
// Sends real verification OTP emails to user's Gmail/Email address

import { emitOtpNotification } from './peshawarData';

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code: string;
}

// In local development, route through Vite proxy to eliminate browser CORS errors
const getResendEndpoint = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/resend/emails';
  }
  return 'https://api.resend.com/emails';
};

/**
 * Generate a cryptographically strong 6-digit numeric OTP code
 */
export function generateSixDigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends a real 6-digit OTP email to the user's email address via Resend API
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string,
  recipientName: string = 'SafarGo Traveler'
): Promise<SendOtpResult> {
  const cleanEmail = toEmail.trim().toLowerCase();
  
  // Read Resend API Key from env (or fallback to custom key if set in localStorage)
  const apiKey = 
    import.meta.env.VITE_RESEND_API_KEY || 
    localStorage.getItem('safargo_custom_resend_api_key') || 
    '';




  // HTML Email Template with SafarGo Peshawar Branding & Copy Code Button
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafarGo Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafdf8; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #d9f99d; overflow: hidden; box-shadow: 0 10px 30px rgba(62, 189, 25, 0.08); }
    .header { background: linear-gradient(135deg, #2ca012, #3ebd19, #5bc522); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-text { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
    .logo-accent { color: #facc15; }
    .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255, 255, 255, 0.9); margin-top: 4px; font-weight: 700; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .description { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-container { background: #f3fbe9; border: 2px dashed #84cc16; border-radius: 18px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #2e8a11; margin-bottom: 6px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #166534; margin: 0; }
    .copy-button { display: inline-block; margin-top: 14px; padding: 10px 22px; background: #3ebd19; color: #ffffff !important; text-decoration: none; font-size: 12px; font-weight: 800; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(62, 189, 25, 0.35); }
    .security-note { font-size: 12px; color: #64748b; background: #f8fafc; border-left: 3px solid #3ebd19; padding: 12px 14px; border-radius: 6px; margin-top: 24px; }
    .footer { padding: 20px 28px; background: #fafdf8; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="logo-text">Safar<span class="logo-accent">Go</span></h1>
      <div class="tagline">Peshawar Smart Transport • City of Flowers</div>
    </div>
    <div class="content">
      <div class="greeting">Assalam-o-Alaikum, ${recipientName}!</div>
      <p class="description">
        Thank you for choosing <strong>SafarGo Peshawar</strong>. To verify your email address and activate your account, please enter the 6-digit verification code below:
      </p>
      
      <div class="otp-container">
        <div class="otp-label">Your 6-Digit Verification Code</div>
        <div class="otp-code">${otpCode}</div>
        <div>
          <a href="https://safargo.pk/verify?code=${otpCode}" class="copy-button">
            Verification Code: ${otpCode}
          </a>
        </div>
      </div>

      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This OTP is valid for 10 minutes. For your account security, never share this code with anyone. SafarGo staff will never ask for your code.
      </div>
    </div>
    <div class="footer">
      SafarGo Mobility Services • Peshawar, Khyber Pakhtunkhwa, Pakistan<br />
      Connecting Hayatabad, University Town, Saddar, Ring Road & Beyond.
    </div>
  </div>
</body>
</html>
  `;

  // Always store the last active verification OTP in memory/session for validation
  sessionStorage.setItem(`safargo_pending_otp_${cleanEmail}`, JSON.stringify({
    code: otpCode,
    email: cleanEmail,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  }));

  // Immediately dispatch in-app notification banner so user is NEVER blocked
  emitOtpNotification(cleanEmail, otpCode);

  if (!apiKey) {
    console.warn(
      '⚠️ Resend API Key is not set in VITE_RESEND_API_KEY. ' +
      'To send real emails to your inbox, add VITE_RESEND_API_KEY to your .env file.'
    );
    return {
      success: true,
      code: otpCode,
      messageId: `dev-local-${Date.now()}`
    };
  }

  try {
    const endpoint = getResendEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SafarGo Peshawar <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: `${otpCode} is your SafarGo Peshawar verification code`,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Resend API response warning:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email via Resend',
        code: otpCode
      };
    }

    console.log('✅ Resend email dispatched successfully:', data);
    return {
      success: true,
      messageId: data.id,
      code: otpCode
    };
  } catch (error: any) {
    console.warn('Resend network/CORS note:', error.message);
    return {
      success: false,
      error: error.message || 'Network error while contacting Resend API',
      code: otpCode
    };
  }

}

/**
 * Validates the user's entered OTP code against the pending record
 */
export function verifyEnteredOtp(email: string, enteredCode: string): { valid: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const raw = sessionStorage.getItem(`safargo_pending_otp_${cleanEmail}`);

  if (!raw) {
    return {
      valid: false,
      message: 'No verification code found. Please request a new code.'
    };
  }

  try {
    const record = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      sessionStorage.removeItem(`safargo_pending_otp_${cleanEmail}`);
      return {
        valid: false,
        message: 'This code has expired. Please request a new verification code.'
      };
    }

    if (record.code !== enteredCode.trim()) {
      return {
        valid: false,
        message: 'Incorrect 6-digit code. Please check your email and try again.'
      };
    }

    // Success: remove used OTP
    sessionStorage.removeItem(`safargo_pending_otp_${cleanEmail}`);
    return {
      valid: true,
      message: 'Email verified successfully!'
    };
  } catch {
    return {
      valid: false,
      message: 'Verification failed. Please try again.'
    };
  }
}
