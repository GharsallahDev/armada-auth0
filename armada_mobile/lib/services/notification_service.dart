import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

@pragma('vm:entry-point')
void _onBackgroundNotificationTapped(NotificationResponse response) {
  debugPrint('Background notification tapped: ${response.payload}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  Function(String requestId, String action)? onCibaAction;

  Future<void> initialize() async {
    // Request permission
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true,
    );

    // Initialize local notifications (v21 named params API)
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _localNotifications.initialize(
      settings: const InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      ),
      onDidReceiveNotificationResponse: _onNotificationTapped,
      onDidReceiveBackgroundNotificationResponse:
          _onBackgroundNotificationTapped,
    );

    // Create notification channel for Android
    const channel = AndroidNotificationChannel(
      'ciba_approvals',
      'CIBA Approvals',
      description: 'Agent authorization requests requiring your approval',
      importance: Importance.max,
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
  }

  Future<String?> getToken() async {
    return await _fcm.getToken();
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final data = message.data;
    final notification = message.notification;

    if (notification != null) {
      _localNotifications.show(
        id: notification.hashCode,
        title: notification.title ?? 'Armada',
        body: notification.body ?? 'New approval request',
        notificationDetails: NotificationDetails(
          android: AndroidNotificationDetails(
            'ciba_approvals',
            'CIBA Approvals',
            importance: Importance.max,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
            actions: data['requestId'] != null
                ? [
                    const AndroidNotificationAction(
                      'approve',
                      'Approve',
                      showsUserInterface: true,
                    ),
                    const AndroidNotificationAction(
                      'deny',
                      'Deny',
                      showsUserInterface: true,
                    ),
                  ]
                : null,
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: data['requestId'],
      );
    }
  }

  void _handleMessageOpenedApp(RemoteMessage message) {
    final requestId = message.data['requestId'];
    if (requestId != null) {
      debugPrint('Opened from notification: $requestId');
    }
  }

  void _onNotificationTapped(NotificationResponse response) {
    final requestId = response.payload;
    final actionId = response.actionId;

    if (requestId != null && actionId != null && onCibaAction != null) {
      onCibaAction!(requestId, actionId);
    }
  }
}
