import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Holds a referral code captured at signup time (typed in manually or from
/// a future deep link) until profile setup completes and can attribute it.
final pendingReferralCodeProvider = StateProvider<String?>((ref) => null);
