import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, text }) => {
  const isMailConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'your_smtp_username' &&
    process.env.EMAIL_PASS && 
    process.env.EMAIL_PASS !== 'your_smtp_password';

  if (!isMailConfigured) {
    // Development fallback: Log email content to the console in a clear box
    console.log('\n' + '='.repeat(60));
    console.log(`✉️  [Mail Service Mock] Dispatching email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(60));
    console.log(text || html);
    console.log('='.repeat(60) + '\n');
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525', 10),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@resumeai.com',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Service] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mail Service Error] Failed to send email to ${to}: ${error.message}`);
    
    // Print fallback log in console on actual SMTP failures so development isn't blocked
    console.log('\n' + '!'.repeat(60));
    console.log(`✉️  [Mail Service Recovery] Fallback output for: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(60));
    console.log(text || html);
    console.log('!'.repeat(60) + '\n');

    return { success: false, error: error.message };
  }
};

export default sendEmail;
