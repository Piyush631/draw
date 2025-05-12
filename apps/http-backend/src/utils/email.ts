import nodemailer from "nodemailer";

import { client } from "@repo/database/db";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "piyushchoudhary.068@gmail.com",
    pass: "uawp vfbz cqju rcad",
  },
});
export async function sendEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const data = await client.user.findUnique({
    where: { email: email },
  });
  console.log(data);
  if (!data) {
    return { success: false, message: "User not found" };
  }

  const otpData = await client.otp.findFirst({
    where: { email },
  });

  const otpDetails = {
    email,
    otp,
    expired_At: new Date(Date.now() + 10 * 60 * 1000),
  };

  if (otpData) {
    const updateOtp = await client.otp.update({
      where: { email },
      data: otpDetails,
    });

    if (!updateOtp) {
      return { success: false, message: "Failed to update OTP" };
    }
  } else {
    await client.otp.create({ data: otpDetails });
  }

  const mailOptions = {
    from: "piyushchoudhary.068@gmail.com",
    to: email,
    subject: "OTP for login",
    text: `Your OTP for login is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
}
