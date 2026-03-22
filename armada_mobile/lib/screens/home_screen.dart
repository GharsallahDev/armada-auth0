import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../models/trust_score.dart';
import '../models/ciba_request.dart';
import 'dart:async';

// ============ Color Constants ============
const _kIndigo = Color(0xFF6366F1);
const _kViolet = Color(0xFF8B5CF6);
const _kBg = Color(0xFF0A0A0B);
const _kSurface = Color(0xFF111115);

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
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
      backgroundColor: _kBg,
      body: Stack(
        children: [
          // Subtle top gradient ambient light
          Positioned(
            top: -100,
            left: -50,
            right: -50,
            height: 300,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    _kIndigo.withValues(alpha: 0.06),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: IndexedStack(
              index: _currentIndex,
              children: [
                _buildDashboard(),
                _buildApprovals(),
                _buildProfile(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ============ Bottom Navigation ============
  Widget _buildBottomNav() {
    final pendingCount = _cibaRequests.where((r) => r.isPending).length;

    return Container(
      decoration: BoxDecoration(
        color: _kSurface.withValues(alpha: 0.95),
        border: Border(
          top: BorderSide(
            color: Colors.white.withValues(alpha: 0.05),
          ),
        ),
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(0, Icons.dashboard_outlined, Icons.dashboard,
                      'Fleet'),
                  _buildNavItem(
                    1,
                    Icons.notifications_outlined,
                    Icons.notifications,
                    'Approvals',
                    badge: pendingCount,
                  ),
                  _buildNavItem(
                      2, Icons.person_outline, Icons.person, 'Profile'),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
      int index, IconData icon, IconData activeIcon, String label,
      {int badge = 0}) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        setState(() => _currentIndex = index);
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color:
              isActive ? _kIndigo.withValues(alpha: 0.12) : Colors.transparent,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: isActive
                      ? _kIndigo
                      : Colors.white.withValues(alpha: 0.4),
                  size: 24,
                ),
                if (badge > 0)
                  Positioned(
                    right: -8,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFFEF4444).withValues(alpha: 0.4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Text(
                        '$badge',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive
                    ? _kIndigo
                    : Colors.white.withValues(alpha: 0.4),
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============ Dashboard Tab ============
  Widget _buildDashboard() {
    final agents = ['comms', 'scheduler', 'finance', 'docs'];
    final pendingCount = _cibaRequests.where((r) => r.isPending).length;
    final avgTrust = _trustScores.isEmpty
        ? 0
        : (_trustScores.values
                    .map((t) => t.decayedScore)
                    .fold(0, (a, b) => a + b) /
                _trustScores.length)
            .round();
    final auth = context.watch<AuthService>();
    final firstName = (auth.userName ?? 'Commander').split(' ').first;

    return RefreshIndicator(
      onRefresh: _loadData,
      color: _kIndigo,
      backgroundColor: _kSurface,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          // App bar area
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.45),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      firstName,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [_kIndigo, _kViolet],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: _kIndigo.withValues(alpha: 0.3),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    (auth.userName ?? 'U')[0].toUpperCase(),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Stats row
          Row(
            children: [
              _buildStatCard(
                'Agents',
                '${_trustScores.length}',
                Icons.smart_toy_outlined,
                _kIndigo,
              ),
              const SizedBox(width: 10),
              _buildStatCard(
                'Avg Trust',
                '$avgTrust',
                Icons.trending_up_rounded,
                const Color(0xFF22C55E),
              ),
              const SizedBox(width: 10),
              _buildStatCard(
                'Pending',
                '$pendingCount',
                Icons.pending_actions_rounded,
                pendingCount > 0
                    ? const Color(0xFFF59E0B)
                    : Colors.white.withValues(alpha: 0.3),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // Section header
          Row(
            children: [
              const Text(
                'Agent Fleet',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: -0.3,
                ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.white.withValues(alpha: 0.05),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF22C55E),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF22C55E)
                                .withValues(alpha: 0.5),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Live',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Agent cards
          ...agents.map((agent) {
            final trust = _trustScores[agent];
            return _AgentCard(
              agentName: agent,
              trust: trust,
              onRevoke: () async {
                HapticFeedback.mediumImpact();
                await _api.revokeTrust(agent);
                _loadData();
              },
            );
          }),

          const SizedBox(height: 24),

          // Kill switch
          _buildKillSwitch(),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Expanded(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Colors.white.withValues(alpha: 0.04),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: color, size: 18),
                const SizedBox(height: 10),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withValues(alpha: 0.4),
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKillSwitch() {
    return GestureDetector(
      onTap: () => _showKillSwitchDialog(),
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [
              Colors.red.shade900.withValues(alpha: 0.6),
              Colors.red.shade800.withValues(alpha: 0.4),
            ],
          ),
          border: Border.all(
            color: Colors.red.withValues(alpha: 0.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withValues(alpha: 0.1),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.power_settings_new_rounded,
              color: Colors.red.shade300,
              size: 22,
            ),
            const SizedBox(width: 10),
            Text(
              'Emergency Kill Switch',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.red.shade200,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showKillSwitchDialog() {
    HapticFeedback.heavyImpact();
    showDialog(
      context: context,
      builder: (ctx) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: AlertDialog(
          backgroundColor: const Color(0xFF141418),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(
              color: Colors.red.withValues(alpha: 0.2),
            ),
          ),
          title: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.red.withValues(alpha: 0.15),
                ),
                child: Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.red.shade400,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Kill Switch',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          content: const Text(
            'This will immediately revoke all trust for every agent, resetting them to Level 0 (Read Only). This action cannot be undone.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          actionsPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: TextButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: Colors.white.withValues(alpha: 0.1),
                          ),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: Colors.white70,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: ElevatedButton(
                      onPressed: () async {
                        HapticFeedback.heavyImpact();
                        Navigator.pop(ctx);
                        await _api.revokeAllTrust();
                        _loadData();
                        if (mounted) {
                          HapticFeedback.heavyImpact();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Row(
                                children: [
                                  Icon(Icons.power_settings_new,
                                      color: Colors.white, size: 18),
                                  SizedBox(width: 10),
                                  Text('All agent trust revoked'),
                                ],
                              ),
                              backgroundColor: Colors.red.shade800,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Revoke All',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ============ Approvals Tab ============
  Widget _buildApprovals() {
    final pending = _cibaRequests.where((r) => r.isPending).toList();
    final resolved = _cibaRequests.where((r) => !r.isPending).toList();

    return RefreshIndicator(
      onRefresh: _loadData,
      color: _kIndigo,
      backgroundColor: _kSurface,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          // Header
          const Text(
            'Approvals',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Approve or deny agent authorization requests',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.45),
            ),
          ),
          const SizedBox(height: 24),

          if (pending.isEmpty && resolved.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 80),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.04),
                      ),
                      child: Icon(
                        Icons.check_circle_outline_rounded,
                        size: 36,
                        color: Colors.white.withValues(alpha: 0.15),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'No approval requests',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withValues(alpha: 0.4),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Chat with Armada to trigger CIBA flows',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.25),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          if (pending.isNotEmpty) ...[
            _buildSectionLabel(
              'PENDING',
              '${pending.length}',
              _kIndigo,
            ),
            const SizedBox(height: 12),
            ...pending.map((req) => _CibaCard(
                  request: req,
                  onApprove: () async {
                    HapticFeedback.mediumImpact();
                    await _api.respondToCiba(req.id, 'approve');
                    _loadData();
                  },
                  onDeny: () async {
                    HapticFeedback.mediumImpact();
                    await _api.respondToCiba(req.id, 'deny');
                    _loadData();
                  },
                )),
          ],

          if (resolved.isNotEmpty) ...[
            const SizedBox(height: 24),
            _buildSectionLabel(
              'HISTORY',
              '${resolved.length}',
              Colors.white.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 12),
            ...resolved.take(20).map((req) => _CibaCard(request: req)),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String text, String count, Color color) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 14,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            color: color,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: color,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            color: color.withValues(alpha: 0.12),
          ),
          child: Text(
            count,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  // ============ Profile Tab ============
  Widget _buildProfile() {
    final auth = context.watch<AuthService>();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      children: [
        const SizedBox(height: 20),

        // Profile header card
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    _kIndigo.withValues(alpha: 0.1),
                    _kViolet.withValues(alpha: 0.05),
                  ],
                ),
                border: Border.all(
                  color: _kIndigo.withValues(alpha: 0.15),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [_kIndigo, _kViolet],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _kIndigo.withValues(alpha: 0.35),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        (auth.userName ?? 'U')[0].toUpperCase(),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    auth.userName ?? 'User',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    auth.userEmail ?? '',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: const Color(0xFF22C55E).withValues(alpha: 0.12),
                      border: Border.all(
                        color:
                            const Color(0xFF22C55E).withValues(alpha: 0.2),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF22C55E),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF22C55E)
                                    .withValues(alpha: 0.5),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Fleet Commander',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF22C55E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 28),

        // Settings section header
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            'CONFIGURATION',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.white.withValues(alpha: 0.3),
              letterSpacing: 1.2,
            ),
          ),
        ),

        _buildSettingsTile(
          Icons.shield_outlined,
          'Auth0 Integration',
          'Connected via OAuth 2.0 + CIBA',
          const Color(0xFF6366F1),
          isConnected: true,
        ),
        _buildSettingsTile(
          Icons.notifications_outlined,
          'Push Notifications',
          'Enabled for CIBA approvals',
          const Color(0xFFF59E0B),
          isConnected: true,
        ),
        _buildSettingsTile(
          Icons.security_outlined,
          'Token Vault',
          'Tokens securely stored via Auth0',
          const Color(0xFF22C55E),
          isConnected: true,
        ),
        _buildSettingsTile(
          Icons.speed_outlined,
          'Trust Engine',
          'Progressive trust with decay scoring',
          const Color(0xFF8B5CF6),
          isConnected: true,
        ),

        const SizedBox(height: 28),

        // Sign out
        GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            auth.logout();
          },
          child: Container(
            height: 52,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Colors.white.withValues(alpha: 0.03),
              border: Border.all(
                color: Colors.red.withValues(alpha: 0.15),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.logout_rounded,
                    color: Colors.red.shade400, size: 20),
                const SizedBox(width: 10),
                Text(
                  'Sign Out',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.red.shade400,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Version
        Center(
          child: Text(
            'Armada v1.0.0',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(alpha: 0.2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsTile(
    IconData icon,
    String title,
    String subtitle,
    Color accentColor, {
    bool isConnected = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Colors.white.withValues(alpha: 0.04),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: accentColor.withValues(alpha: 0.1),
                  ),
                  child: Icon(icon, color: accentColor, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.4),
                        ),
                      ),
                    ],
                  ),
                ),
                if (isConnected)
                  Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                    ),
                    child: const Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFF22C55E),
                      size: 18,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ============ Agent Card Widget ============

class _AgentCard extends StatefulWidget {
  final String agentName;
  final TrustScore? trust;
  final VoidCallback onRevoke;

  const _AgentCard({
    required this.agentName,
    this.trust,
    required this.onRevoke,
  });

  @override
  State<_AgentCard> createState() => _AgentCardState();
}

class _AgentCardState extends State<_AgentCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  late Animation<double> _progressAnim;
  double _previousProgress = 0;

  static const _icons = {
    'comms': Icons.mail_outline_rounded,
    'scheduler': Icons.calendar_today_rounded,
    'finance': Icons.account_balance_wallet_outlined,
    'docs': Icons.description_outlined,
  };

  static const _colors = {
    0: Color(0xFFEF4444),
    1: Color(0xFFF59E0B),
    2: Color(0xFF3B82F6),
    3: Color(0xFF22C55E),
  };

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    final targetProgress = (widget.trust?.decayedScore ?? 0) / 750;
    _progressAnim = Tween<double>(begin: 0, end: targetProgress).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeOutCubic),
    );
    _previousProgress = targetProgress;
    _progressController.forward();
  }

  @override
  void didUpdateWidget(covariant _AgentCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    final newProgress = (widget.trust?.decayedScore ?? 0) / 750;
    if (newProgress != _previousProgress) {
      _progressAnim =
          Tween<double>(begin: _previousProgress, end: newProgress).animate(
        CurvedAnimation(
            parent: _progressController, curve: Curves.easeOutCubic),
      );
      _previousProgress = newProgress;
      _progressController
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final level = widget.trust?.level ?? 0;
    final score = widget.trust?.decayedScore ?? 0;
    final color = _colors[level] ?? const Color(0xFFEF4444);
    final icon = _icons[widget.agentName] ?? Icons.smart_toy_outlined;
    final label = widget.trust?.agentLabel ?? widget.agentName;
    final levelName = widget.trust?.levelName ?? 'Read Only';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.white.withValues(alpha: 0.04),
              border: Border.all(
                color: color.withValues(alpha: 0.12),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    // Agent icon with glow
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(13),
                        color: color.withValues(alpha: 0.1),
                        boxShadow: [
                          BoxShadow(
                            color: color.withValues(alpha: 0.15),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: Icon(icon, color: color, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            label,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                              letterSpacing: -0.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(6),
                                  color: color.withValues(alpha: 0.12),
                                ),
                                child: Text(
                                  'L$level',
                                  style: TextStyle(
                                    color: color,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                levelName,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withValues(alpha: 0.4),
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '$score',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: color,
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'pts',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white.withValues(alpha: 0.3),
                          ),
                        ),
                      ],
                    ),
                    if (level > 0) ...[
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: widget.onRevoke,
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.red.withValues(alpha: 0.1),
                          ),
                          child: const Icon(Icons.block_rounded,
                              color: Color(0xFFEF4444), size: 16),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 14),
                // Animated trust progress bar
                AnimatedBuilder(
                  animation: _progressAnim,
                  builder: (context, child) {
                    return Container(
                      height: 5,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(3),
                        color: Colors.white.withValues(alpha: 0.05),
                      ),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: FractionallySizedBox(
                          widthFactor: _progressAnim.value.clamp(0.0, 1.0),
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(3),
                              gradient: LinearGradient(
                                colors: [
                                  color.withValues(alpha: 0.7),
                                  color,
                                ],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: color.withValues(alpha: 0.3),
                                  blurRadius: 6,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
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
      'approved' => const Color(0xFF22C55E),
      'denied' => const Color(0xFFEF4444),
      'expired' => const Color(0xFFF59E0B),
      _ => _kIndigo,
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: isPending
                  ? _kIndigo.withValues(alpha: 0.04)
                  : Colors.white.withValues(alpha: 0.03),
              border: Border.all(
                color: isPending
                    ? _kIndigo.withValues(alpha: 0.15)
                    : Colors.white.withValues(alpha: 0.05),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Pulsing dot for pending
                    if (isPending) ...[
                      _PulsingDot(color: _kIndigo),
                      const SizedBox(width: 10),
                    ],
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: statusColor.withValues(alpha: 0.12),
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
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        color: Colors.white.withValues(alpha: 0.05),
                      ),
                      child: Text(
                        request.serviceLabel,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 11,
                        ),
                      ),
                    ),
                    const Spacer(),
                    if (!isPending)
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: statusColor.withValues(alpha: 0.12),
                        ),
                        child: Icon(
                          request.status == 'approved'
                              ? Icons.check_circle_rounded
                              : request.status == 'denied'
                                  ? Icons.cancel_rounded
                                  : Icons.timer_off_rounded,
                          color: statusColor,
                          size: 18,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  request.action,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                    height: 1.3,
                  ),
                ),
                if (request.details != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    request.details!,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.4),
                      height: 1.4,
                    ),
                  ),
                ],
                if (isPending) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 44,
                          child: GestureDetector(
                            onTap: onDeny,
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(11),
                                color: Colors.red.withValues(alpha: 0.08),
                                border: Border.all(
                                  color: Colors.red.withValues(alpha: 0.2),
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  'Deny',
                                  style: TextStyle(
                                    color: Colors.red.shade400,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: SizedBox(
                          height: 44,
                          child: GestureDetector(
                            onTap: onApprove,
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(11),
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF22C55E),
                                    Color(0xFF16A34A),
                                  ],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF22C55E)
                                        .withValues(alpha: 0.25),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Center(
                                child: Text(
                                  'Approve',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ============ Pulsing Dot Widget ============

class _PulsingDot extends StatefulWidget {
  final Color color;

  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color.withValues(alpha: _animation.value),
            boxShadow: [
              BoxShadow(
                color:
                    widget.color.withValues(alpha: 0.4 * _animation.value),
                blurRadius: 8,
                spreadRadius: 1,
              ),
            ],
          ),
        );
      },
    );
  }
}
