export const detectSensitiveData = (resource: string, content?: string): boolean => {
  if (!resource) return false;

  const normalizedResource = resource.toLowerCase();
  let isSensitive = false;

  // 1. Filename / Resource name heuristics
  const sensitiveKeywords = [
    'salary',
    'customer',
    'password',
    'secret',
    'credential',
    'api_key',
    'confidential',
    'private',
    'auth',
    'employee'
  ];

  for (const keyword of sensitiveKeywords) {
    if (normalizedResource.includes(keyword)) {
      isSensitive = true;
      break;
    }
  }

  // 2. Content-based heuristics (if content is provided in the request)
  if (!isSensitive && content) {
    const sensitivePatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone
      /\b(?:\d[ -]*?){13,16}\b/, // Credit Card (basic)
      /\b\d{4}\s\d{4}\s\d{4}\b/, // Aadhaar (basic format)
      /(sk_live|pk_live|sk_test|pk_test)_[a-zA-Z0-9]+/, // API Keys (Stripe-like)
      /ghp_[a-zA-Z0-9]{36}/, // GitHub token
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        isSensitive = true;
        break;
      }
    }
  }

  return isSensitive;
};
