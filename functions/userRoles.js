const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.setCustomUserClaims = functions.auth.user().onCreate(async (user) => {
  // Your logic to determine if the user is an admin based on some criteria.
  const isAdmin = await determineIfUserIsAdmin(user.uid);

  // Set the custom claim "admin" to true if the user is an admin.
  if (isAdmin) {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  }

  // If not an admin, set a default claim (optional).
  return admin.auth().setCustomUserClaims(user.uid, { client: true });
});

async function determineIfUserIsAdmin(uid) {
    try {
        // Fetch the user's roles from the roles node using the user's UID
        const rolesSnapshot = await admin.database().ref(`/users/${uid}/roles`).once("value");
        const roles = rolesSnapshot.val();
    
        // Check if the user has the "admin" role set to true
        const isAdmin = roles && roles.admin === true;
    
        return isAdmin;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        // In case of an error, you can handle it here or return a default value (e.g., false).
        return false;
    }
}
