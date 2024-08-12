const admin = require("firebase-admin");
const serviceAccount = require("../helpers/stackoverflow-auth-298a3-firebase-adminsdk-7g9jr-67e41cae75.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const getAllUserTokens = async () => {
  return "frH_ETZiPFVE0ZmcyYKfyr:APA91bFGM_jL_Q1-zuHyI7uAzUopttWAYQzlSnircBT_xKJE_A0IL0ZYmzUsuFHaFgexUkvDbmJ85iW8-9NMEOab8chjt4nowPmURfaDb3PzxmhTN8ozkipy_dbQsYnzF1x9AIM9pJzQ";
};

const sendNotificationToAllUsers = async (title, body, data) => {
  try {
    const token =
      "frH_ETZiPFVE0ZmcyYKfyr:APA91bGzP48pM0Sqov2lcVbzZMkxKvS6lL_mwzRElt9qj2qVDatmmihWtHbaAQwQBwkweOKwgjR0egds6CMTH8MJpLmQrSIL5NOoVpA3qWFW_MHWvHTa0rA9miOlpBSzrhq6tSB1KP25";

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

module.exports = { sendNotificationToAllUsers };
