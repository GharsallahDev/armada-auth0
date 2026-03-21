class CibaRequest {
  final String id;
  final String agentName;
  final String action;
  final String? details;
  final String service;
  final String status;
  final DateTime expiresAt;
  final DateTime createdAt;

  CibaRequest({
    required this.id,
    required this.agentName,
    required this.action,
    this.details,
    required this.service,
    required this.status,
    required this.expiresAt,
    required this.createdAt,
  });

  factory CibaRequest.fromJson(Map<String, dynamic> json) {
    return CibaRequest(
      id: json['id'],
      agentName: json['agentName'] ?? json['agent_name'],
      action: json['action'],
      details: json['details'],
      service: json['service'],
      status: json['status'],
      expiresAt: DateTime.parse(json['expiresAt'] ?? json['expires_at']),
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
    );
  }

  bool get isPending => status == 'pending';
  bool get isExpired => DateTime.now().isAfter(expiresAt);

  String get agentLabel {
    switch (agentName) {
      case 'comms':
        return 'Comms Agent';
      case 'scheduler':
        return 'Scheduler Agent';
      case 'finance':
        return 'Finance Agent';
      case 'docs':
        return 'Docs Agent';
      case 'orchestrator':
        return 'Orchestrator';
      default:
        return agentName;
    }
  }

  String get serviceLabel {
    switch (service) {
      case 'gmail':
        return 'Gmail';
      case 'calendar':
        return 'Calendar';
      case 'stripe':
        return 'Stripe';
      case 'slack':
        return 'Slack';
      case 'drive':
        return 'Drive';
      default:
        return service;
    }
  }
}
