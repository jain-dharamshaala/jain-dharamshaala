const nodemailer = require("nodemailer");
const oAuth2Client = require("@config/oauth2Client");
const logger = require("@config/logger");
const fs = require("fs");
const User = require("@models/User");

const getEmailTemplateFile = (status) => {
  let emailTemplateFile;
  if (status === "confirmed") {
    emailTemplateFile = "public/email-templates/booking-confirmation.html";
  } else if (status === "pending") {
    emailTemplateFile = "public/email-templates/booking-pending.html";
  } else if (status === "cancelled") {
    emailTemplateFile = "public/email-templates/booking-cancelled.html";
  } else {
    throw new Error("Invalid status");
  }
  return emailTemplateFile;
};

const getTransporter = async () => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "jain.dharamshaala@gmail.com",
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  return transporter;
};

exports.sendBookingAcknowledgment = async (booking, status) => {
  try {
    const emailTemplateFile = getEmailTemplateFile(status);
    const emailTemplate = fs.readFileSync(emailTemplateFile, "utf8");
    const customer = await User.findById(booking.customer_id);
    let customerEmail = customer.email;
    console.log(customerEmail + " fetched from customer object");
    customerEmail = "aashaysinghai26@gmail.com";
    const formattedEmail = emailTemplate
      .replace("{{ bookingId }}", booking._id)
      .replace("{{ userName }}", "Aahi");
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: "jain.dharamshaala@gmail.com",
      to: customerEmail,
      subject: `Jain Dharamshaala Booking ${booking._id} : ${status}`,
      html: formattedEmail,
    });
    logger.info(
      ` Booking Id (${booking._id} ) Acknowledgement (${status}) email sent successfully to : ${customerEmail}`
    );
  } catch (error) {
    logger.error(
      `Booking Id (${booking._id} ) Acknowledgement (${status}) Email Failure : `,
      error
    );
  }
};

exports.sendEmailUsingOAuth2 = async (token) => {
  try {
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = await getTransporter();
    const emailTemplate = fs.readFileSync(
      "public/email-templates/verify-email.html",
      "utf8"
    );
    // Replace the '{{ token }}' placeholder with the generated token in the email template
    // TODO token undefined is going need to check this. later
    const formattedEmail = emailTemplate.replace("{{ token }}", token);
    console.log(formattedEmail);
    // Construct email message
    const mailOptions = {
      from: "jain-dharamshaala@gmail.com",
      to: "aashaysinghai26@gmail.com",
      subject: "Verify Email for Jain-Dharamshaala :)",
      html: formattedEmail,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent for verification :", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = await getTransporter();

    await transporter.sendMail({
      from: "jain-dharamshaala@gmail.com",
      to: email,
      subject: "Jain Dharamshaala : Password Reset",
      html: `<p>You requested a password reset. Click <a href="http://localhost:9000/api/auth/verify-reset-token?token=${resetToken}&email=${email}">here</a> to reset your password.</p>`,
    });

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
