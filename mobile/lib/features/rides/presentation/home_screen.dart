import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/models/ride_match.dart';
import '../../../shared/models/user_role.dart';
import '../../referrals/presentation/referral_screen.dart';
import '../application/ride_providers.dart';
import 'create_ride_screen.dart';
import 'match_detail_screen.dart';

class HomeScreen extends ConsumerWidget {
  final String userId;
  final UserRole role;

  const HomeScreen({super.key, required this.userId, required this.role});

  bool get _showsDriverActions => role == UserRole.driver || role == UserRole.both;
  bool get _showsPassengerMatches => role == UserRole.passenger || role == UserRole.both;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FellaRide'),
        actions: [
          IconButton(
            icon: const Icon(Icons.card_giftcard_rounded),
            tooltip: 'Invite someone',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ReferralScreen(userId: userId)),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Log out',
            onPressed: () => ref.read(authRepositoryProvider).signOut(),
          ),
        ],
      ),
      floatingActionButton: _showsDriverActions
          ? FloatingActionButton.extended(
              icon: const Icon(Icons.add_road_rounded),
              label: const Text('Offer a ride'),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => CreateRideScreen(driverId: userId)),
              ),
            )
          : null,
      body: _showsPassengerMatches
          ? _MatchList(userId: userId)
          : _DriverOnlyPlaceholder(showsDriverActions: _showsDriverActions),
    );
  }
}

class _DriverOnlyPlaceholder extends StatelessWidget {
  final bool showsDriverActions;
  const _DriverOnlyPlaceholder({required this.showsDriverActions});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Text(
          showsDriverActions
              ? "You're set up as a driver. Tap \"Offer a ride\" to post your route."
              : "No role configured.",
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}

class _MatchList extends ConsumerWidget {
  final String userId;
  const _MatchList({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final matchesAsync = ref.watch(rideMatchesProvider(userId));

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(rideMatchesProvider(userId)),
      child: matchesAsync.when(
        loading: () => const _CenteredLoader(),
        error: (e, _) => _ScrollableMessage(
          icon: Icons.error_outline_rounded,
          message: 'Could not load matches.\n$e',
        ),
        data: (matches) {
          if (matches.isEmpty) {
            return const _ScrollableMessage(
              icon: Icons.search_off_rounded,
              message: 'No ride matches yet.\nPull down to check again once a driver posts your route.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: matches.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, i) => _MatchCard(match: matches[i]),
          );
        },
      ),
    );
  }
}

class _MatchCard extends StatelessWidget {
  final RideMatch match;
  const _MatchCard({required this.match});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.all(AppSpacing.md),
        leading: CircleAvatar(
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Icon(Icons.directions_car_rounded, color: theme.colorScheme.onPrimaryContainer),
        ),
        title: Text('${match.ride.route.origin} → ${match.ride.route.destination}'),
        subtitle: Text(
          '${match.distanceKm.toStringAsFixed(1)} km · ${match.timeOffsetMinutes.toStringAsFixed(0)} min offset · ${match.status}',
        ),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => MatchDetailScreen(match: match)),
        ),
      ),
    );
  }
}

class _CenteredLoader extends StatelessWidget {
  const _CenteredLoader();
  @override
  Widget build(BuildContext context) => const Center(child: CircularProgressIndicator());
}

class _ScrollableMessage extends StatelessWidget {
  final IconData icon;
  final String message;
  const _ScrollableMessage({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 40, color: Theme.of(context).colorScheme.outline),
                  const SizedBox(height: AppSpacing.sm),
                  Text(message, textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
