exports.passwordUpdateTemplate = (userName) => {
  return `
  <html>
    <body>
      <h2>Hello ${userName || 'User'},</h2>
      <p>Your password was updated successfully. If you did not perform this action, please contact support immediately.</p>
      <p>Regards,<br/>The Team</p>
    </body>
  </html>
  `;
};
