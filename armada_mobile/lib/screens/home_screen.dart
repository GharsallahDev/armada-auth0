import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../models/trust_score.dart';
import '../models/ciba_request.dart';
import 'dart:async';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late ApiService _api;
  Map<String, TrustScore> _trustScores = {};
  List<CibaRequest> _cibaRequests = [];
  Timer? _pollTimer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _api = ApiService(() => auth.accessToken);
    _loadData();
    _pollTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => _loadData(),
    );
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final scores = await _api.getTrustScores();
      final ciba = await _api.getCibaRequests();
      if (mounted) {
        setState(() {
          _trustScores = scores;
          _cibaRequests = ciba;
        });
      }
    } catch (e) {
      debugPrint('Data load error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0B),
      body: SafeArea(
        child: IndexedStack(
          index: _currentIndex,
          children: [
            _buildDashboard(),
            _buildApprovals(),
            _buildProfile(),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        backgroundColor: const Color(0xFF111113),
        surfaceTintColor: Colors.transparent,
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        indicatorColor: const Color(0xFF6366F1).withValues(alpha: 0.2),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined, color: Colors.white54),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF6366F1)),
            label: 'Fleet',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: _cibaRequests.any((r) => r.isPending),
              label: Text(
                '${_cibaRequests.where((r) => r.isPending).length}',
                style: const TextStyle(fontSize: 10),
              ),
              child: const Icon(
                Icons.notifications_outlined,
                color: Colors.white54,
              ),
            ),
            selectedIcon: const Icon(
              Icons.notifications,
              color: Color(0xFF6366F1),
            ),
            label: 'Approvals',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline, color: Colors.white54),
            selectedIcon: Icon(Icons.person, color: Color(0xFF6366F1)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard() {
    final agents = ['comms', 'scheduler', 'finance', 'docs'];

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Agent Fleet',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Monitor your AI agents in real-time',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 24),

          // Agent cards
          ...agents.map((agent) {
            final trust = _trustScores[agent];
            return _AgentCard(
              agentName: agent,
              trust: trust,
              onRevoke: () async {
                await _api.revokeTrust(agent);
                _loadData();
              },
            );
          }),

          const SizedBox(height: 24),

          // Kill switch
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton.icon(
              onPressed: () => _showKillSwitchDialog(),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade900,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              icon: const Icon(Icons.power_settings_new),
              label: const Text(
                'Emergency Kill Switch',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showKillSwitchDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1D),
        title: const Text('Emergency Kill Switch',
            style: TextStyle(color: Colors.white)),
        content: const Text(
          'This will immediately revoke all trust for every agent, resetting them to Level 0 (Read Only). This action cannot be undone.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await _api.revokeAllTrust();
              _loadData();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('All agent trust revoked'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Revoke All'),
          ),
        ],
      ),
    );
  }

  Widget _buildApprovals() {
    final pending = _cibaRequests.where((r) => r.isPending).toList();
    final resolved = _cibaRequests.where((r) => !r.isPending).toList();

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'CIBA Approvals',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Approve or deny agent authorization requests',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 24),

          if (pending.isEmpty && resolved.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 80),
                child: Column(
                  children: [
                    Icon(Icons.check_circle_outline,
                        size: 64, color: Colors.white.withValues(alpha: 0.2)),
                    const SizedBox(height: 16),
                    Text(
                      'No approval requests',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Chat with Armada to trigger CIBA flows',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          if (pending.isNotEmpty) ...[
            Text(
              'PENDING (${pending.length})',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6366F1),
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 12),
            ...pending.map((req) => _CibaCard(
                  request: req,
                  onApprove: () async {
                    await _api.respondToCiba(req.id, 'approve');
                    _loadData();
                  },
                  onDeny: () async {
                    await _api.respondToCiba(req.id, 'deny');
                    _loadData();
                  },
                )),
          ],

          if (resolved.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text(
              'HISTORY',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white.withValues(alpha: 0.4),
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 12),
            ...resolved.take(20).map((req) => _CibaCard(request: req)),
          ],
        ],
      ),
    );
  }

  Widget _buildProfile() {
    final auth = context.watch<AuthService>();

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 20),
        Center(
          child: CircleAvatar(
            radius: 40,
            backgroundColor: const Color(0xFF6366F1),
            child: Text(
              (auth.userName ?? 'U')[0].toUpperCase(),
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: Text(
            auth.userName ?? 'User',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        Center(
          child: Text(
            auth.userEmail ?? '',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
        ),
        const SizedBox(height: 32),

        _buildSettingsTile(
          Icons.shield_outlined,
          'Auth0 Integration',
          'Connected via OAuth 2.0 + CIBA',
        ),
        _buildSettingsTile(
          Icons.notifications_outlined,
          'Push Notifications',
          'Enabled for CIBA approvals',
        ),
        _buildSettingsTile(
          Icons.security_outlined,
          'Token Vault',
          'Tokens securely stored via Auth0',
        ),

        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: () => auth.logout(),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.red,
              side: const BorderSide(color: Colors.red),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Colors.white.withValues(alpha: 0.04),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF6366F1), size: 22),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.w600)),
                Text(subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withValues(alpha: 0.5),
                    )),
              ],
            ),
          ),
          Icon(Icons.check_circle,
              color: Colors.green.withValues(alpha: 0.7), size: 20),
        ],
      ),
    );
  }
}

// ============ Agent Card Widget ============

class _AgentCard extends StatelessWidget {
  final String agentName;
  final TrustScore? trust;
  final VoidCallback onRevoke;

  const _AgentCard({
    required this.agentName,
    this.trust,
    required this.onRevoke,
  });

  static const _icons = {
    'comms': Icons.mail_outline,
    'scheduler': Icons.calendar_today_outlined,
    'finance': Icons.attach_money,
    'docs': Icons.description_outlined,
  };

  static const _colors = {
    0: Color(0xFFEF4444),
    1: Color(0xFFF59E0B),
    2: Color(0xFF3B82F6),
    3: Color(0xFF22C55E),
  };

  @override
  Widget build(BuildContext context) {
    final level = trust?.level ?? 0;
    final score = trust?.decayedScore ?? 0;
    final color = _colors[level] ?? const Color(0xFFEF4444);
    final icon = _icons[agentName] ?? Icons.smart_toy;
    final label = trust?.agentLabel ?? agentName;
    final levelName = trust?.levelName ?? 'Read Only';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withValues(alpha: 0.04),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: color.withValues(alpha: 0.1),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        )),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6),
                            color: color.withValues(alpha: 0.15),
                          ),
                          child: Text(
                            'L$level · $levelName',
                            style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$score pts',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.4),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (level > 0)
                IconButton(
                  onPressed: onRevoke,
                  icon: const Icon(Icons.block, color: Colors.red, size: 20),
                  tooltip: 'Revoke Trust',
                ),
            ],
          ),
          const SizedBox(height: 12),
          // Trust progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: score / 750,
              backgroundColor: Colors.white.withValues(alpha: 0.06),
              color: color,
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}

// ============ CIBA Card Widget ============

class _CibaCard extends StatelessWidget {
  final CibaRequest request;
  final VoidCallback? onApprove;
  final VoidCallback? onDeny;

  const _CibaCard({
    required this.request,
    this.onApprove,
    this.onDeny,
  });

  @override
  Widget build(BuildContext context) {
    final isPending = request.isPending && !request.isExpired;
    final statusColor = switch (request.status) {
      'approved' => Colors.green,
      'denied' => Colors.red,
      'expired' => Colors.orange,
      _ => const Color(0xFF6366F1),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withValues(alpha: 0.04),
        border: Border.all(
          color: isPending
              ? const Color(0xFF6366F1).withValues(alpha: 0.3)
              : Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  color: statusColor.withValues(alpha: 0.15),
                ),
                child: Text(
                  request.agentLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  color: Colors.white.withValues(alpha: 0.06),
                ),
                child: Text(
                  request.serviceLabel,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.6),
                    fontSize: 11,
                  ),
                ),
              ),
              const Spacer(),
              if (!isPending)
                Icon(
                  request.status == 'approved'
                      ? Icons.check_circle
                      : request.status == 'denied'
                          ? Icons.cancel
                          : Icons.timer_off,
                  color: statusColor,
                  size: 18,
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            request.action,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (request.details != null) ...[
            const SizedBox(height: 4),
            Text(
              request.details!,
              style: TextStyle(
                fontSize: 13,
                color: Colors.white.withValues(alpha: 0.5),
              ),
            ),
          ],
          if (isPending) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: OutlinedButton(
                      onPressed: onDeny,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text('Deny'),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: ElevatedButton(
                      onPressed: onApprove,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF22C55E),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text('Approve'),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
