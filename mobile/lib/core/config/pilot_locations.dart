import '../../shared/models/geo_point.dart';

/// Fixed set of named locations around the pilot community, used for home/work
/// and ride origin/destination pickers. A real map/geocoding picker would
/// replace this, but a dropdown of known landmarks is enough to exercise the
/// backend's real geo-distance matching for a demo, without map SDK setup.
class PilotLocations {
  const PilotLocations._();

  static const List<GeoPoint> all = [
    GeoPoint(lat: 13.0108, lng: 74.7942, label: 'Kadri'),
    GeoPoint(lat: 12.9950, lng: 74.8000, label: 'Campus Main Gate'),
    GeoPoint(lat: 13.0210, lng: 74.8100, label: 'Old Town'),
    GeoPoint(lat: 12.9800, lng: 74.7850, label: 'Bus Stand'),
    GeoPoint(lat: 13.0050, lng: 74.8250, label: 'Tech Park Road'),
    GeoPoint(lat: 12.9700, lng: 74.7700, label: 'Riverside Layout'),
    GeoPoint(lat: 13.0300, lng: 74.7900, label: 'Hillview Hostel Block'),
    GeoPoint(lat: 12.9900, lng: 74.8400, label: 'East Market'),
  ];
}
