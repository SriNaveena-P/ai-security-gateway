export interface PromptInjectionResult {
  detected: boolean;
  type?: string;
  severity?: string;
}

export const detectPromptInjection = (text: string): PromptInjectionResult => {
  if (!text) return { detected: false };

  const normalizedText = text.toLowerCase();

  const suspiciousPatterns = [
    { type: 'IGNORE_INSTRUCTIONS', pattern: /ignore previous instructions/i },
    { type: 'IGNORE_SECURITY', pattern: /ignore all security rules/i },
    { type: 'BYPASS_RESTRICTIONS', pattern: /bypass restrictions/i },
    { type: 'DISABLE_SECURITY', pattern: /disable security/i },
    { type: 'SYSTEM_PROMPT_LEAK', pattern: /reveal system prompt/i },
    { type: 'CONFIDENTIAL_ACCESS', pattern: /give me confidential information/i },
    { type: 'OVERRIDE_PERMISSIONS', pattern: /override permissions/i },
    { type: 'DAN_JAILBREAK', pattern: /do anything now/i }
  ];

  for (const rule of suspiciousPatterns) {
    if (rule.pattern.test(normalizedText)) {
      return {
        detected: true,
        type: 'PROMPT_INJECTION',
        severity: 'HIGH'
      };
    }
  }

  return { detected: false };
};
