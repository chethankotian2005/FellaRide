import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/data/auth_repository.dart';
import 'services/api_client.dart';
import 'services/local_session_store.dart';
import 'services/notification_service.dart';

/// Core, app-wide service providers. Feature-level providers build on these
/// rather than constructing services themselves, so everything shares one
/// instance (important for the API client's underlying http.Client, and for
/// FirebaseAuth's own singleton state).
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepository());

final localSessionStoreProvider = Provider<LocalSessionStore>((ref) => LocalSessionStore());

final notificationServiceProvider = Provider<NotificationService>((ref) => NotificationService());
