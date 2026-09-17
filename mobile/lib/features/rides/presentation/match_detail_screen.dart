import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/models/ride_match.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_card.dart';

class MatchDetailScreen extends ConsumerStatefulWidget {
  final RideMatch match;
  const MatchDetailScreen({super.key, required this.match});

  @override
  ConsumerState<MatchDetailScreen> createState() => _MatchDetailScreenState();
}

class _MatchDetailScreenState extends ConsumerState<MatchDetailScreen> {
  bool _loading = false;
  bool _requested = false;
  String? _error;

  Future<void> _requestToJoin() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ref.read(apiClientProvider).acceptMatch(widget.match.id);

      // TODO(server): once a real push trigger exists (see
      // core/services/notification_service.dart), the driver would get a
      // push here. For now the driver sees it by pulling to refresh their
      // own match list.

      setState(() => _requested = true);
    } catch (e) {
      setState(() => _error = 'Could not send request: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final match = widget.match;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Ride details')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.trip_origin_rounded, size: 18, color: theme.colorScheme.primary),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(child: Text(match.ride.route.origin.toString())),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 2, horizontal: 8),
                      child: SizedBox(height: 16, child: VerticalDivider()),
                    ),
                    Row(
                      children: [
                        Icon(Icons.flag_rounded, size: 18, color: theme.colorScheme.secondary),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(child: Text(match.ride.route.destination.toString())),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _DetailRow(label: 'Departs', value: match.ride.departureTime),
                    _DetailRow(label: 'Seats available', value: '${match.ride.seatsAvailable}'),
                    _DetailRow(label: 'Distance to route', value: '${match.distanceKm.toStringAsFixed(1)} km'),
                    _DetailRow(
                      label: 'Time offset',
                      value: '${match.timeOffsetMinutes.toStringAsFixed(0)} min from your usual time',
                    ),
                    _DetailRow(label: 'Status', value: match.status),
                  ],
                ),
              ),
              const Spacer(),
              if (_error != null) ...[
                Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
                const SizedBox(height: AppSpacing.md),
              ],
              if (_requested)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle_rounded, color: theme.colorScheme.primary),
                    const SizedBox(width: AppSpacing.sm),
                    const Text('Request sent — waiting on the driver.'),
                  ],
                )
              else
                PrimaryButton(
                  label: 'Request to join',
                  onPressed: _requestToJoin,
                  loading: _loading,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(value, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
