import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ciba_request.dart';
import '../models/trust_score.dart';

class ApiService {
  static const _baseUrl = 'https://armada-eight.vercel.app';

  final String? Function() _getToken;

  ApiService(this._getToken);

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_getToken() != null) 'Authorization': 'Bearer ${_getToken()}',
        if (_getToken() != null) 'Cookie': 'appSession=${_getToken()}',
      };

  // Trust scores
  Future<Map<String, TrustScore>> getTrustScores() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/trust'),
      headers: _headers,
    );
    if (response.statusCode != 200) return {};

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data.map(
      (key, value) => MapEntry(
        key,
        TrustScore.fromJson(key, value as Map<String, dynamic>),
      ),
    );
  }

  // CIBA requests
  Future<List<CibaRequest>> getCibaRequests() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/api/ciba'),
      headers: _headers,
    );
    if (response.statusCode != 200) return [];

    final data = jsonDecode(response.body) as List;
    return data
        .map((e) => CibaRequest.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<bool> respondToCiba(String requestId, String action) async {
    final response = await http.patch(
      Uri.parse('$_baseUrl/api/ciba/$requestId'),
      headers: _headers,
      body: jsonEncode({'action': action}),
    );
    return response.statusCode == 200;
  }

  // Device token registration
  Future<bool> registerDeviceToken(String token, String platform) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/devices'),
      headers: _headers,
      body: jsonEncode({'token': token, 'platform': platform}),
    );
    return response.statusCode == 200;
  }

  // Revoke trust
  Future<bool> revokeTrust(String agentName) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/trust/$agentName'),
      headers: _headers,
      body: jsonEncode({'action': 'revoke'}),
    );
    return response.statusCode == 200;
  }

  Future<bool> revokeAllTrust() async {
    final response = await http.post(
      Uri.parse('$_baseUrl/api/trust/revoke-all'),
      headers: _headers,
    );
    return response.statusCode == 200;
  }
}
