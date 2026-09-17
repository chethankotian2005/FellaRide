enum UserRole {
  driver,
  passenger,
  both;

  String get apiValue => name;

  static UserRole fromApi(String value) => UserRole.values.firstWhere(
        (r) => r.apiValue == value,
        orElse: () => UserRole.passenger,
      );

  String get label => switch (this) {
        UserRole.driver => 'Driver',
        UserRole.passenger => 'Passenger',
        UserRole.both => 'Both',
      };
}
