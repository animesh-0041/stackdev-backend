const admin = require("firebase-admin");

const serviceAccount = require("../helpers/stackoverflow-auth-298a3-firebase-adminsdk-7g9jr-b10317a912.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = { messaging };
