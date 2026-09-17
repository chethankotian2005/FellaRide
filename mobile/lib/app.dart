import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/application/auth_providers.dart';
import 'features/auth/presentation/welcome_screen.dart';
import 'features/onboarding/application/profile_providers.dart';
import 'features/onboarding/presentation/profile_setup_screen.dart';
import 'features/rides/presentation/home_screen.dart';

class FellaRideApp extends StatelessWidget {
  const FellaRideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FellaRide',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: const AuthGate(),
    );
  }
}

/// Root routing decision, driven entirely by provider state rather than
/// named routes: signed out -> Welcome, signed in but no backend profile yet
/// -> ProfileSetup, both done -> Home. See feature screens for how they pop
/// back to this widget after completing their step (the state change alone
/// is what causes this widget to rebuild with a different child).
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return authState.when(
      loading: () => const _SplashLoader(),
      error: (e, _) => _ErrorScreen(message: 'Auth error: $e'),
      data: (user) {
        if (user == null) return const WelcomeScreen();

        final profileStatus = ref.watch(profileStatusProvider);
        return profileStatus.when(
          loading: () => const _SplashLoader(),
          error: (e, _) => _ErrorScreen(message: 'Could not load profile: $e'),
          data: (status) {
            if (!status.complete || status.backendUserId == null || status.role == null) {
              return const ProfileSetupScreen();
            }
            return HomeScreen(userId: status.backendUserId!, role: status.role!);
          },
        );
      },
    );
  }
}

class _SplashLoader extends StatelessWidget {
  const _SplashLoader();
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: CircularProgressIndicator()));
}

class _ErrorScreen extends StatelessWidget {
  final String message;
  const _ErrorScreen({required this.message});

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Text(message, textAlign: TextAlign.center),
          ),
        ),
      );
}
