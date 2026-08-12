import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "EMAIL_USER and EMAIL_PASS must be set in environment variables",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const subject = "Verify your Memory account";
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <p>Hi,</p>
      <p>Your Memory account verification code is:</p>
      <h2 style="margin: 0; padding: 0;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Memory App" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}
