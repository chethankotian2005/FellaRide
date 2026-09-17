import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../shared/models/app_user.dart';
import '../../shared/models/geo_point.dart';
import '../../shared/models/ride_match.dart';
import '../config/app_config.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Thin, typed wrapper around the FellaRide backend REST API
/// (see backend/README.md for the full endpoint reference). Keeping all HTTP
/// calls here means the base URL and error handling live in exactly one
/// place.
class ApiClient {
  final http.Client _client;
  final String baseUrl;

  ApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        baseUrl = baseUrl ?? AppConfig.apiBaseUrl;

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('$baseUrl$path').replace(queryParameters: query);

  Map<String, dynamic> _decode(http.Response res) {
    if (res.statusCode >= 400) {
      String message = res.body;
      try {
        final parsed = jsonDecode(res.body) as Map<String, dynamic>;
        message = parsed['error'] as String? ?? message;
      } catch (_) {
        // response body wasn't JSON — fall back to raw body as the message.
      }
      throw ApiException(message, statusCode: res.statusCode);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<AppUser> upsertUser({
    String? id,
    required String name,
    required String role,
    required GeoPoint homeLocation,
    required GeoPoint workLocation,
    required List<String> commuteDays,
    required String commuteDepartureTime,
    String? referredBy,
  }) async {
    final res = await _client.post(
      _uri('/users'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        // ignore: use_null_aware_elements
        if (id != null) 'id': id,
        'name': name,
        'role': role,
        'homeLocation': homeLocation.toJson(),
        'workLocation': workLocation.toJson(),
        'commuteSchedule': {'days': commuteDays, 'departureTime': commuteDepartureTime},
        // ignore: use_null_aware_elements
        if (referredBy != null) 'referredBy': referredBy,
      }),
    );
    return AppUser.fromJson(_decode(res));
  }

  Future<void> createRide({
    required String driverId,
    required GeoPoint origin,
    required GeoPoint destination,
    required DateTime departureTime,
    required int seatsAvailable,
  }) async {
    final res = await _client.post(
      _uri('/rides'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'driverId': driverId,
        'route': {'origin': origin.toJson(), 'destination': destination.toJson()},
        // Deliberately NOT .toUtc() — the backend treats departureTime as a
        // wall-clock "HH:mm" (see isoToTimeOfDay() in geo.util.ts) compared
        // directly against the passenger's commuteSchedule.departureTime,
        // which is also naive local time. Converting to UTC here would
        // silently shift matches by the device's UTC offset.
        'departureTime': departureTime.toIso8601String(),
        'seatsAvailable': seatsAvailable,
      }),
    );
    _decode(res);
  }

  Future<List<RideMatch>> getRideMatches(String userId) async {
    final res = await _client.get(_uri('/rides/matches', {'userId': userId}));
    final body = _decode(res);
    final matches = (body['matches'] as List).cast<Map<String, dynamic>>();
    return matches.map(RideMatch.fromJson).toList();
  }

  Future<void> acceptMatch(String matchId) async {
    final res = await _client.post(_uri('/matches/$matchId/accept'));
    _decode(res);
  }

  Future<void> createReferral({
    required String referrerId,
    required String refereeId,
    required String outcome,
  }) async {
    final res = await _client.post(
      _uri('/referrals'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'referrerId': referrerId, 'refereeId': refereeId, 'outcome': outcome}),
    );
    _decode(res);
  }
}
