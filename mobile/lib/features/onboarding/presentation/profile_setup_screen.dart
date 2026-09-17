import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/pilot_locations.dart';
import '../../../core/providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/models/geo_point.dart';
import '../../../shared/models/user_role.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_card.dart';
import '../../auth/application/auth_providers.dart';
import '../../referrals/application/referral_providers.dart';
import '../application/profile_providers.dart';

const _weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();

  UserRole _role = UserRole.passenger;
  GeoPoint? _home;
  GeoPoint? _work;
  final Set<String> _selectedDays = {'mon', 'tue', 'wed', 'thu', 'fri'};
  TimeOfDay _departureTime = const TimeOfDay(hour: 8, minute: 30);

  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  String get _departureTimeString =>
      '${_departureTime.hour.toString().padLeft(2, '0')}:${_departureTime.minute.toString().padLeft(2, '0')}';

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_home == null || _work == null) {
      setState(() => _error = 'Choose both a home and work location');
      return;
    }
    if (_selectedDays.isEmpty) {
      setState(() => _error = 'Pick at least one commute day');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final firebaseUser = ref.read(authStateProvider).value;
      if (firebaseUser == null) throw StateError('No authenticated user');

      final referralCode = ref.read(pendingReferralCodeProvider);

      final user = await ref.read(apiClientProvider).upsertUser(
            id: firebaseUser.uid,
            name: _nameController.text.trim(),
            role: _role.apiValue,
            homeLocation: _home!,
            workLocation: _work!,
            commuteDays: _weekdays.where(_selectedDays.contains).toList(),
            commuteDepartureTime: _departureTimeString,
            referredBy: referralCode,
          );

      if (referralCode != null && referralCode.isNotEmpty) {
        try {
          await ref.read(apiClientProvider).createReferral(
                referrerId: referralCode,
                refereeId: user.id,
                outcome: 'registered',
              );
        } catch (_) {
          // Referral attribution is best-effort — an invalid/unknown code
          // shouldn't block the person from finishing signup.
        }
        ref.read(pendingReferralCodeProvider.notifier).state = null;
      }

      final store = ref.read(localSessionStoreProvider);
      await store.setBackendUserId(user.id);
      await store.setUserRole(user.role.apiValue);
      await store.setProfileComplete(true);
      ref.invalidate(profileStatusProvider);
    } catch (e) {
      setState(() => _error = 'Could not save profile: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Set up your profile')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Full name'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter your name' : null,
                ),
                const SizedBox(height: AppSpacing.lg),
                Text('I am a...', style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: AppSpacing.sm),
                SegmentedButton<UserRole>(
                  segments: const [
                    ButtonSegment(value: UserRole.passenger, label: Text('Passenger')),
                    ButtonSegment(value: UserRole.driver, label: Text('Driver')),
                    ButtonSegment(value: UserRole.both, label: Text('Both')),
                  ],
                  selected: {_role},
                  onSelectionChanged: (s) => setState(() => _role = s.first),
                ),
                const SizedBox(height: AppSpacing.lg),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Commute', style: Theme.of(context).textTheme.labelLarge),
                      const SizedBox(height: AppSpacing.md),
                      DropdownButtonFormField<GeoPoint>(
                        initialValue: _home,
                        decoration: const InputDecoration(labelText: 'Home location'),
                        items: PilotLocations.all
                            .map((p) => DropdownMenuItem(value: p, child: Text(p.label!)))
                            .toList(),
                        onChanged: (v) => setState(() => _home = v),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      DropdownButtonFormField<GeoPoint>(
                        initialValue: _work,
                        decoration: const InputDecoration(labelText: 'Work / campus location'),
                        items: PilotLocations.all
                            .map((p) => DropdownMenuItem(value: p, child: Text(p.label!)))
                            .toList(),
                        onChanged: (v) => setState(() => _work = v),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text('Commute days', style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        children: _weekdays.map((d) {
                          final selected = _selectedDays.contains(d);
                          return FilterChip(
                            label: Text(d.toUpperCase()),
                            selected: selected,
                            onSelected: (v) => setState(
                              () => v ? _selectedDays.add(d) : _selectedDays.remove(d),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Preferred departure time'),
                        trailing: Text(
                          _departureTimeString,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        onTap: () async {
                          final picked = await showTimePicker(
                            context: context,
                            initialTime: _departureTime,
                          );
                          if (picked != null) setState(() => _departureTime = picked);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                if (_error != null) ...[
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  const SizedBox(height: AppSpacing.md),
                ],
                PrimaryButton(label: 'Finish setup', onPressed: _submit, loading: _loading),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
