import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/pilot_locations.dart';
import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/models/geo_point.dart';
import '../../../shared/widgets/primary_button.dart';

class CreateRideScreen extends ConsumerStatefulWidget {
  final String driverId;
  const CreateRideScreen({super.key, required this.driverId});

  @override
  ConsumerState<CreateRideScreen> createState() => _CreateRideScreenState();
}

class _CreateRideScreenState extends ConsumerState<CreateRideScreen> {
  GeoPoint? _origin;
  GeoPoint? _destination;
  TimeOfDay _departureTime = const TimeOfDay(hour: 8, minute: 30);
  DateTime _departureDate = DateTime.now();
  int _seats = 3;

  bool _loading = false;
  String? _error;
  bool _success = false;

  Future<void> _submit() async {
    if (_origin == null || _destination == null) {
      setState(() => _error = 'Choose both an origin and destination');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    final departureAt = DateTime(
      _departureDate.year,
      _departureDate.month,
      _departureDate.day,
      _departureTime.hour,
      _departureTime.minute,
    );

    try {
      await ref.read(apiClientProvider).createRide(
            driverId: widget.driverId,
            origin: _origin!,
            destination: _destination!,
            departureTime: departureAt,
            seatsAvailable: _seats,
          );
      setState(() => _success = true);
    } catch (e) {
      setState(() => _error = 'Could not create ride: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        appBar: AppBar(title: const Text('Offer a ride')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle_rounded, size: 56, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: AppSpacing.md),
                Text('Ride posted!', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: AppSpacing.sm),
                const Text('Passengers on your route will start seeing it as a match.'),
                const SizedBox(height: AppSpacing.lg),
                PrimaryButton(label: 'Done', onPressed: () => Navigator.of(context).pop()),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Offer a ride')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<GeoPoint>(
                initialValue: _origin,
                decoration: const InputDecoration(labelText: 'Pick-up point'),
                items: PilotLocations.all
                    .map((p) => DropdownMenuItem(value: p, child: Text(p.label!)))
                    .toList(),
                onChanged: (v) => setState(() => _origin = v),
              ),
              const SizedBox(height: AppSpacing.md),
              DropdownButtonFormField<GeoPoint>(
                initialValue: _destination,
                decoration: const InputDecoration(labelText: 'Destination'),
                items: PilotLocations.all
                    .map((p) => DropdownMenuItem(value: p, child: Text(p.label!)))
                    .toList(),
                onChanged: (v) => setState(() => _destination = v),
              ),
              const SizedBox(height: AppSpacing.md),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Departure date'),
                trailing: Text(
                  '${_departureDate.year}-${_departureDate.month.toString().padLeft(2, '0')}-${_departureDate.day.toString().padLeft(2, '0')}',
                ),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _departureDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 30)),
                  );
                  if (picked != null) setState(() => _departureDate = picked);
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Departure time'),
                trailing: Text(
                  '${_departureTime.hour.toString().padLeft(2, '0')}:${_departureTime.minute.toString().padLeft(2, '0')}',
                ),
                onTap: () async {
                  final picked = await showTimePicker(context: context, initialTime: _departureTime);
                  if (picked != null) setState(() => _departureTime = picked);
                },
              ),
              const SizedBox(height: AppSpacing.md),
              Text('Seats available: $_seats', style: Theme.of(context).textTheme.bodyMedium),
              Slider(
                value: _seats.toDouble(),
                min: 1,
                max: 6,
                divisions: 5,
                label: '$_seats',
                onChanged: (v) => setState(() => _seats = v.round()),
              ),
              const SizedBox(height: AppSpacing.lg),
              if (_error != null) ...[
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                const SizedBox(height: AppSpacing.md),
              ],
              PrimaryButton(label: 'Post ride', onPressed: _submit, loading: _loading),
            ],
          ),
        ),
      ),
    );
  }
}
