exports.courseEnrolledTemplate = (userName, courseTitle) => {
  return `
  <html>
    <body>
      <h2>Hi ${userName},</h2>
      <p>Congratulations! You are now enrolled in <strong>${courseTitle}</strong>.</p>
      <p>We hope you enjoy the course — start learning now!</p>
      <p>Best regards,<br/>The Team</p>
    </body>
  </html>
  `;
};
