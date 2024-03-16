const oAuth2Client = require('../../config/oauth2Client')
const nodemailer = require('nodemailer');

const getTransporter = async () => {
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'jain.dharamshaala@gmail.com',
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
  }  
  
  exports.sendBookingAcknowledgment = async (customerEmail) => {
    try {
        // Send email.
        console.log('Booking acknowledgment email sending...');
        const transporter = await getTransporter();
        await transporter.sendMail({
            from: 'jain.dharamshaala@gmail.com',
            to: customerEmail,
            subject: 'Jain Dharamshaala Booking Acknowledgement',
            html: '<p>Your booking has been acknowledged. Thank you for choosing our service!</p>'
        });
        console.log('Booking acknowledgment email sent successfully');
    } catch (error) {
        console.error('Failed to send booking acknowledgment email:', error);
    }
  };

  exports.sendEmailUsingOAuth2 = async (token) => {
    try {
      // Create a Nodemailer transporter with OAuth2 authentication
      const transporter = await getTransporter();
      const emailTemplate = fs.readFileSync('public/email-templates/verify-email.html', 'utf8');
          // Replace the '{{ token }}' placeholder with the generated token in the email template
      const formattedEmail = emailTemplate.replace('{{ token }}', token);
      console.log(formattedEmail);
      // Construct email message
      const mailOptions = {
        from: 'jain-dharamshaala@gmail.com',
        to: "aashaysinghai26@gmail.com",
        subject: 'Verify Email for Jain-Dharamshaala :)',
        html: formattedEmail
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent for verification :', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };