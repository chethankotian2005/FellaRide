class CommuteSchedule {
  final List<String> days;
  final String departureTime; // "HH:mm"

  const CommuteSchedule({required this.days, required this.departureTime});

  factory CommuteSchedule.fromJson(Map<String, dynamic> json) => CommuteSchedule(
        days: (json['days'] as List).cast<String>(),
        departureTime: json['departureTime'] as String,
      );

  Map<String, dynamic> toJson() => {'days': days, 'departureTime': departureTime};
}
