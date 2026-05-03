import nodemailer from 'nodemailer';

async function testMail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // port 587 uses STARTTLS
    auth: {
      user: 'matthew.shim@prisincera.com',
      pass: 'cwuqyoebkvldhseo',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"PriSignal Test" <matthew.shim@prisincera.com>',
      to: 'matthew.shim@prisincera.com',
      subject: 'Test Email from Nodemailer',
      text: 'This is a test email.',
    });
    console.log('✅ 발송 성공:', info.messageId);
  } catch (err) {
    console.error('❌ 발송 실패:', err);
  }
}

testMail();
