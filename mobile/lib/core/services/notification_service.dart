import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Wraps Firebase Cloud Messaging for push notifications (match requests,
/// referral nudges).
///
/// WHAT'S REAL: requesting notification permission, fetching the device's
/// FCM token, and listening for foreground messages.
///
/// WHAT'S STUBBED (documented, not implemented — see TODOs): actually
/// *sending* a push when a driver receives a match request. That requires a
/// server-side trigger, which doesn't exist yet:
///   TODO(server): add a Cloud Function (or a call from
///   POST /rides/matches in the backend) that, on a new pending Match
///   document, looks up the driver's registered FCM token and calls the
///   Firebase Admin SDK's `messaging().send(...)` with a payload like
///   { notification: { title: "New match request", body: "..." },
///     data: { rideId, matchId } }.
///   TODO(mobile): once that exists, call [registerToken] after login/profile
///   setup to POST the token to a new backend endpoint (e.g.
///   POST /users/:id/fcm-token) so the server knows where to send it.
class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<String?> initialize() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('[notifications] permission denied — push disabled for this session');
      return null;
    }

    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('[notifications] foreground message: ${message.notification?.title}');
    });

    try {
      return await _messaging.getToken();
    } catch (e) {
      // Getting a real token requires platform messaging setup (e.g. a
      // registered sender on web) that may not be present in every dev
      // environment — don't let that block the rest of the app.
      debugPrint('[notifications] could not fetch FCM token: $e');
      return null;
    }
  }

  /// TODO(server): wire this to a real backend endpoint once one exists.
  Future<void> registerToken(String userId, String token) async {
    debugPrint('[notifications] STUB: would register token for user $userId');
  }
}
