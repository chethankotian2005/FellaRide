import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fellaride_mobile/core/theme/app_theme.dart';

void main() {
  testWidgets('App theme applies without error', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: AppTheme.light(),
      home: const Scaffold(body: Center(child: Text('FellaRide'))),
    ));

    expect(find.text('FellaRide'), findsOneWidget);
  });
}
