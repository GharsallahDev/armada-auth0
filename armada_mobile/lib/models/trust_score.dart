class TrustScore {
  final String agentName;
  final int score;
  final int level;
  final int decayedScore;

  TrustScore({
    required this.agentName,
    required this.score,
    required this.level,
    required this.decayedScore,
  });

  factory TrustScore.fromJson(String name, Map<String, dynamic> json) {
    return TrustScore(
      agentName: name,
      score: json['score'] ?? 0,
      level: json['level'] ?? 0,
      decayedScore: json['decayedScore'] ?? 0,
    );
  }

  String get levelName {
    switch (level) {
      case 0:
        return 'Read Only';
      case 1:
        return 'Draft';
      case 2:
        return 'Execute w/ Confirm';
      case 3:
        return 'Autonomous';
      default:
        return 'Unknown';
    }
  }

  String get agentLabel {
    switch (agentName) {
      case 'comms':
        return 'Comms Agent';
      case 'scheduler':
        return 'Scheduler';
      case 'finance':
        return 'Finance';
      case 'docs':
        return 'Docs Agent';
      default:
        return agentName;
    }
  }
}
