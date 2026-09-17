import 'ride.dart';

/// Mirrors the MatchWithRide shape returned by GET /rides/matches
/// (backend/src/services/matching.service.ts).
class RideMatch {
  final String id;
  final String rideId;
  final String passengerId;
  final String status;
  final double distanceKm;
  final double timeOffsetMinutes;
  final Ride ride;

  const RideMatch({
    required this.id,
    required this.rideId,
    required this.passengerId,
    required this.status,
    required this.distanceKm,
    required this.timeOffsetMinutes,
    required this.ride,
  });

  factory RideMatch.fromJson(Map<String, dynamic> json) => RideMatch(
        id: json['id'] as String,
        rideId: json['rideId'] as String,
        passengerId: json['passengerId'] as String,
        status: json['status'] as String,
        distanceKm: (json['distanceKm'] as num).toDouble(),
        timeOffsetMinutes: (json['timeOffsetMinutes'] as num).toDouble(),
        ride: Ride.fromJson(json['ride'] as Map<String, dynamic>),
      );
}
