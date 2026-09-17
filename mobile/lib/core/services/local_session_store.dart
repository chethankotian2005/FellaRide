import 'package:shared_preferences/shared_preferences.dart';

/// Persists just enough locally so a returning user skips profile setup —
/// the backend user document (fetched fresh via the API) remains the source
/// of truth for everything else.
class LocalSessionStore {
  static const _kBackendUserId = 'backend_user_id';
  static const _kProfileComplete = 'profile_complete';
  static const _kPendingReferralCode = 'pending_referral_code';
  static const _kUserRole = 'user_role';

  Future<String?> getBackendUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kBackendUserId);
  }

  Future<void> setBackendUserId(String id) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kBackendUserId, id);
  }

  /// Cached alongside the backend user id since the backend has no
  /// `GET /users/:id` endpoint yet to re-fetch it from — see
  /// backend/README.md for the current endpoint list.
  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kUserRole);
  }

  Future<void> setUserRole(String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUserRole, role);
  }

  Future<bool> isProfileComplete() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kProfileComplete) ?? false;
  }

  Future<void> setProfileComplete(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kProfileComplete, value);
  }

  /// Captured at signup time (from a deep link or manual entry) and consumed
  /// once profile setup successfully creates the backend user.
  Future<String?> getPendingReferralCode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kPendingReferralCode);
  }

  Future<void> setPendingReferralCode(String? code) async {
    final prefs = await SharedPreferences.getInstance();
    if (code == null) {
      await prefs.remove(_kPendingReferralCode);
    } else {
      await prefs.setString(_kPendingReferralCode, code);
    }
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kBackendUserId);
    await prefs.remove(_kProfileComplete);
    await prefs.remove(_kPendingReferralCode);
    await prefs.remove(_kUserRole);
  }
}
