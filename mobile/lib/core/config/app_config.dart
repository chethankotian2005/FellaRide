/// App-wide configuration. Values are compile-time constants so they can be
/// overridden per build without code changes, e.g.:
///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000
/// (Android emulator can't reach the host's "localhost" directly — use
/// 10.0.2.2, which is the emulator's alias for the host loopback. iOS
/// simulator, web, and desktop can all use localhost directly.)
class AppConfig {
  const AppConfig._();

  /// Name of the pilot community this build targets — surfaced in onboarding
  /// copy so the app feels contextual rather than generic. Matches the
  /// placeholder pilot community used by the backend's discovery service
  /// (backend/src/services/discoveryMockData.ts) — keep them in sync.
  static const String pilotCommunityName = String.fromEnvironment(
    'PILOT_COMMUNITY_NAME',
    defaultValue: 'Crestwood Institute of Technology — CSE Dept',
  );

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000',
  );
}
