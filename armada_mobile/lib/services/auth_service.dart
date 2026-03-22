import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_appauth/flutter_appauth.dart';

class AuthService extends ChangeNotifier {
  static const _domain = 'dev-n0xwzuzwpzw70ed0.us.auth0.com';
  static const _clientId = 'TmisLwaiWkr0O7Tb2Cw3XYG35sRyOtAd';
  static const _redirectUri = 'com.armada.armadamobile://callback';
  static const _issuer = 'https://$_domain';

  final FlutterAppAuth _appAuth = const FlutterAppAuth();

  String? _accessToken;
  String? _idToken;
  String? _refreshToken;
  String? _userId;
  String? _userName;
  String? _userEmail;
  bool _isAuthenticated = false;

  String? get accessToken => _accessToken;
  String? get idToken => _idToken;
  String? get userId => _userId;
  String? get userName => _userName;
  String? get userEmail => _userEmail;
  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login() async {
    try {
      final result = await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          _clientId,
          _redirectUri,
          issuer: _issuer,
          scopes: ['openid', 'profile', 'email', 'offline_access'],
          additionalParameters: {
            'audience': 'https://api.armada-fleet.com',
          },
        ),
      );

      _accessToken = result.accessToken;
      _idToken = result.idToken;
      _refreshToken = result.refreshToken;
      _parseIdToken(result.idToken!);
      _isAuthenticated = true;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Auth error: $e');
    }
    return false;
  }

  Future<void> logout() async {
    try {
      await _appAuth.endSession(
        EndSessionRequest(
          idTokenHint: _idToken,
          postLogoutRedirectUrl: _redirectUri,
          issuer: _issuer,
        ),
      );
    } catch (e) {
      debugPrint('Logout error: $e');
    }
    _clearSession();
  }

  Future<void> refreshAccessToken() async {
    if (_refreshToken == null) return;
    try {
      final result = await _appAuth.token(
        TokenRequest(
          _clientId,
          _redirectUri,
          issuer: _issuer,
          refreshToken: _refreshToken,
        ),
      );
      _accessToken = result.accessToken;
      _idToken = result.idToken;
      _refreshToken = result.refreshToken ?? _refreshToken;
      notifyListeners();
    } catch (e) {
      debugPrint('Token refresh error: $e');
      _clearSession();
    }
  }

  void _clearSession() {
    _accessToken = null;
    _idToken = null;
    _refreshToken = null;
    _userId = null;
    _userName = null;
    _userEmail = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  void _parseIdToken(String idToken) {
    final parts = idToken.split('.');
    if (parts.length != 3) return;

    final normalized = base64Url.normalize(parts[1]);
    final decoded = utf8.decode(base64Url.decode(normalized));
    final data = jsonDecode(decoded) as Map<String, dynamic>;

    _userId = data['sub'] as String?;
    _userName = data['name'] as String?;
    _userEmail = data['email'] as String?;
  }
}
