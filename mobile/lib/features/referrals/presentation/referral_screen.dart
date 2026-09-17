import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/config/app_config.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_card.dart';

/// A referral "code" is just the referrer's own backend user id — simple,
/// and it's exactly the id the referee needs to enter at signup for
/// POST /referrals to attribute the registration correctly (see
/// ProfileSetupScreen._submit).
class ReferralScreen extends StatelessWidget {
  final String userId;
  const ReferralScreen({super.key, required this.userId});

  String get _shareMessage =>
      "I'm using FellaRide to carpool around ${AppConfig.pilotCommunityName}. "
      "Join with my invite code and we can share a ride: $userId";

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Invite someone on your route')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Know someone who commutes the same way? Invite them — you\'ll both '
                'get matched faster once there are more people on your route.',
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.lg),
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Your invite code', style: theme.textTheme.labelLarge),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: SelectableText(
                            userId,
                            style: theme.textTheme.titleMedium?.copyWith(fontFamily: 'monospace'),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded),
                          tooltip: 'Copy',
                          onPressed: () async {
                            await Clipboard.setData(ClipboardData(text: userId));
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Copied to clipboard')),
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Share invite',
                onPressed: () => SharePlus.instance.share(ShareParams(text: _shareMessage)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
