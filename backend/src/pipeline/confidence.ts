type ConfidenceInput = {
  ambiguity: number;
  missingInformation: number;
  repairCount: number;
  issueCount: number;
  base: number;
};

function clamp(value: number) {
  return Math.max(0.2, Math.min(0.99, Number(value.toFixed(2))));
}

export function calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount, base }: ConfidenceInput) {
  return clamp(base - ambiguity * 0.06 - missingInformation * 0.05 - repairCount * 0.04 - issueCount * 0.03);
}

export function deriveConfidenceScores(intent: { ambiguity: string[]; missing_information: string[] }, validationIssues: number, repairCount: number) {
  const ambiguity = intent.ambiguity.length;
  const missingInformation = intent.missing_information.length;

  return {
    intent_extraction: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.96 }),
    system_design: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.93 }),
    ui_generation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.92 }),
    api_generation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.91 }),
    database_generation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.94 }),
    auth_generation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.9 }),
    business_generation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.89 }),
    validation: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.95 }),
    repair: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.88 }),
    runtime: calculateStageConfidence({ ambiguity, missingInformation, repairCount, issueCount: validationIssues, base: 0.96 }),
  };
}
