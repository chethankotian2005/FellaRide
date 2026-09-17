import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../../shared/models/ride_match.dart';

final rideMatchesProvider =
    FutureProvider.autoDispose.family<List<RideMatch>, String>((ref, userId) async {
  return ref.watch(apiClientProvider).getRideMatches(userId);
});
