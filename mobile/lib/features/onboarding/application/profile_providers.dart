import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../../shared/models/user_role.dart';

/// Whether the signed-in Firebase user has completed the backend profile
/// setup (role, home/work location, commute schedule). Re-read after
/// [profileStatusProvider] is invalidated post-submission.
class ProfileStatus {
  final bool complete;
  final String? backendUserId;
  final UserRole? role;

  const ProfileStatus({required this.complete, this.backendUserId, this.role});
}

final profileStatusProvider = FutureProvider<ProfileStatus>((ref) async {
  final store = ref.watch(localSessionStoreProvider);
  final complete = await store.isProfileComplete();
  final userId = await store.getBackendUserId();
  final roleValue = await store.getUserRole();
  return ProfileStatus(
    complete: complete,
    backendUserId: userId,
    role: roleValue != null ? UserRole.fromApi(roleValue) : null,
  );
});
