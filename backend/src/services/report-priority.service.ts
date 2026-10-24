export type ReportPriority = "HIGH" | "MEDIUM" | "LOW";

export function classifyReportPriority(content: string): ReportPriority {
  const text = content.toLowerCase();

  const highPriorityKeywords = [
    "trapped",
    "life-threatening",
    "critical injury",
    "severe bleeding",
    "collapsed building",
    "urgent rescue",
    "people missing",
    "emergency rescue",
  ];

  const mediumPriorityKeywords = [
    "injured",
    "medical help",
    "shelter",
    "food shortage",
    "drinking water",
    "power outage",
    "road blocked",
  ];

  if (highPriorityKeywords.some((word) => text.includes(word))) {
    return "HIGH";
  }

  if (mediumPriorityKeywords.some((word) => text.includes(word))) {
    return "MEDIUM";
  }

  return "LOW";
}
