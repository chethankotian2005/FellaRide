class GeoPoint {
  final double lat;
  final double lng;
  final String? label;

  const GeoPoint({required this.lat, required this.lng, this.label});

  factory GeoPoint.fromJson(Map<String, dynamic> json) => GeoPoint(
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        label: json['label'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'lng': lng,
        if (label != null) 'label': label,
      };

  @override
  String toString() => label ?? '($lat, $lng)';
}
