exports.emailVerificationTemplate = (userName, otp) => {
  return `
  <html>
    <body>
      <h2>Hello ${userName || 'User'},</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>Use this code to complete your signup. This code will expire shortly.</p>
      <p>Thanks,<br/>The Team</p>
    </body>
  </html>
  `;
};
