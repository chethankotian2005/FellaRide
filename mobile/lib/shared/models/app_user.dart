import 'commute_schedule.dart';
import 'geo_point.dart';
import 'user_role.dart';

/// Mirrors backend/src/models/user.model.ts.
class AppUser {
  final String id;
  final String name;
  final UserRole role;
  final GeoPoint homeLocation;
  final GeoPoint workLocation;
  final CommuteSchedule commuteSchedule;
  final String? referredBy;

  const AppUser({
    required this.id,
    required this.name,
    required this.role,
    required this.homeLocation,
    required this.workLocation,
    required this.commuteSchedule,
    this.referredBy,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        name: json['name'] as String,
        role: UserRole.fromApi(json['role'] as String),
        homeLocation: GeoPoint.fromJson(json['homeLocation'] as Map<String, dynamic>),
        workLocation: GeoPoint.fromJson(json['workLocation'] as Map<String, dynamic>),
        commuteSchedule:
            CommuteSchedule.fromJson(json['commuteSchedule'] as Map<String, dynamic>),
        referredBy: json['referredBy'] as String?,
      );
}
