import 'geo_point.dart';

class RideRoute {
  final GeoPoint origin;
  final GeoPoint destination;

  const RideRoute({required this.origin, required this.destination});

  factory RideRoute.fromJson(Map<String, dynamic> json) => RideRoute(
        origin: GeoPoint.fromJson(json['origin'] as Map<String, dynamic>),
        destination: GeoPoint.fromJson(json['destination'] as Map<String, dynamic>),
      );

  Map<String, dynamic> toJson() => {'origin': origin.toJson(), 'destination': destination.toJson()};
}

/// Mirrors backend/src/models/ride.model.ts.
class Ride {
  final String id;
  final String driverId;
  final RideRoute route;
  final String departureTime; // ISO 8601
  final int seatsAvailable;
  final String status;

  const Ride({
    required this.id,
    required this.driverId,
    required this.route,
    required this.departureTime,
    required this.seatsAvailable,
    required this.status,
  });

  factory Ride.fromJson(Map<String, dynamic> json) => Ride(
        id: json['id'] as String,
        driverId: json['driverId'] as String,
        route: RideRoute.fromJson(json['route'] as Map<String, dynamic>),
        departureTime: json['departureTime'] as String,
        seatsAvailable: json['seatsAvailable'] as int,
        status: json['status'] as String,
      );
}
