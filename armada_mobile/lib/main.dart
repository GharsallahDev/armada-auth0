import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style for premium feel
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0A0A0B),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Initialize Firebase (will be configured when Firebase project is set up)
  try {
    await Firebase.initializeApp();
    await NotificationService().initialize();
  } catch (e) {
    debugPrint('Firebase init skipped: $e');
  }

  runApp(const ArmadaApp());
}

class ArmadaApp extends StatelessWidget {
  const ArmadaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthService(),
      child: MaterialApp(
        title: 'Armada',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0A0A0B),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6366F1),
            brightness: Brightness.dark,
            surface: const Color(0xFF0A0A0B),
          ),
          useMaterial3: true,
          // Typography
          textTheme: const TextTheme(
            displayLarge: TextStyle(
              fontFamily: '.SF Pro Display',
              fontWeight: FontWeight.w700,
              letterSpacing: -1.5,
            ),
            headlineLarge: TextStyle(
              fontFamily: '.SF Pro Display',
              fontWeight: FontWeight.w700,
              letterSpacing: -0.5,
            ),
            headlineMedium: TextStyle(
              fontFamily: '.SF Pro Display',
              fontWeight: FontWeight.w600,
              letterSpacing: -0.3,
            ),
            titleLarge: TextStyle(
              fontFamily: '.SF Pro Display',
              fontWeight: FontWeight.w600,
              letterSpacing: -0.2,
            ),
            titleMedium: TextStyle(
              fontFamily: '.SF Pro Text',
              fontWeight: FontWeight.w500,
              letterSpacing: 0,
            ),
            bodyLarge: TextStyle(
              fontFamily: '.SF Pro Text',
              fontWeight: FontWeight.w400,
              letterSpacing: 0,
            ),
            bodyMedium: TextStyle(
              fontFamily: '.SF Pro Text',
              fontWeight: FontWeight.w400,
              letterSpacing: 0,
            ),
            labelLarge: TextStyle(
              fontFamily: '.SF Pro Text',
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          // Card theme
          cardTheme: CardThemeData(
            color: Colors.white.withValues(alpha: 0.05),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          // Snackbar
          snackBarTheme: SnackBarThemeData(
            backgroundColor: const Color(0xFF1A1A2E),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          // Dialog
          dialogTheme: DialogThemeData(
            backgroundColor: const Color(0xFF141418),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        home: Consumer<AuthService>(
          builder: (context, auth, _) {
            return auth.isAuthenticated
                ? const HomeScreen()
                : const LoginScreen();
          },
        ),
      ),
    );
  }
}
