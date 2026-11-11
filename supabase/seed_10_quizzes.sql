-- Comprehensive Seed Script: 10 Diverse Quizzes with 5 Questions Each (50 Questions, 200 Options)
-- Breakdown:
-- 5 LIVE Quizzes: Foundations of the Web, Database Essentials, JavaScript & TypeScript, React & Next.js, Algorithms
-- 3 UPCOMING Quizzes: Cloud & DevOps, Cybersecurity & Web Defense, AI & Machine Learning
-- 2 FINISHED Quizzes: History of Computing, Git & Collaborative Workflows

BEGIN;

-- 1. Insert Quizzes (draft mode first to safely populate questions before publish trigger)
INSERT INTO public.quizzes (
  id, title, description, category, instructions,
  marks_per_question, seconds_per_question, duration_seconds,
  starts_at, ends_at, is_published, is_featured
)
VALUES
  -- 1. LIVE: Foundations of the Web
  (
    '10000000-0000-4000-8000-000000000001',
    'Foundations of the Web',
    'Test your knowledge on the core pillars of the web: HTML, CSS, HTTP protocols, and browser DOM.',
    'Web Development',
    'Select the single correct option for each question. Speed counts for tie-breaking!',
    2, 30, 300,
    now() - interval '2 days', now() + interval '30 days',
    false, true
  ),
  -- 2. LIVE: Database Essentials & SQL
  (
    '10000000-0000-4000-8000-000000000002',
    'Database Essentials & SQL',
    'Challenge yourself on relational database principles, SQL joins, ACID properties, and indexing.',
    'Databases',
    'Read each question carefully. Each correct answer awards 2 points.',
    2, 30, 450,
    now() - interval '2 days', now() + interval '30 days',
    false, true
  ),
  -- 3. LIVE: Modern JavaScript & TypeScript
  (
    '10000000-0000-4000-8000-000000000003',
    'Modern JavaScript & TypeScript',
    'Evaluate your understanding of ES6+, asynchronous JavaScript, closures, and static typing.',
    'Programming',
    'Choose the best answer for each question. Answers can be revisited before submission.',
    2, 30, 450,
    now() - interval '2 days', now() + interval '30 days',
    false, true
  ),
  -- 4. LIVE: React & Next.js Architecture
  (
    '10000000-0000-4000-8000-000000000004',
    'React & Next.js Architecture',
    'Dive deep into Server Components, React hooks, rendering lifecycles, and modern App Router patterns.',
    'Web Development',
    'Choose one option per question. Server validates all submissions atomically.',
    2, 30, 450,
    now() - interval '2 days', now() + interval '30 days',
    false, false
  ),
  -- 5. LIVE: Data Structures & Algorithms
  (
    '10000000-0000-4000-8000-000000000005',
    'Data Structures & Algorithms',
    'Test your fundamental CS skills in algorithmic complexity, trees, queues, and graph traversal.',
    'Computer Science',
    'Calculators not allowed. Analyze Big-O time and space tradeoffs for each question.',
    2, 30, 600,
    now() - interval '2 days', now() + interval '30 days',
    false, false
  ),
  -- 6. UPCOMING: Cloud & DevOps Fundamentals
  (
    '10000000-0000-4000-8000-000000000006',
    'Cloud & DevOps Fundamentals',
    'Explore Docker containers, CI/CD pipelines, DNS records, and serverless architectures.',
    'DevOps & Cloud',
    'This competitive quiz opens soon. Preview details and prepare with your study group.',
    2, 30, 450,
    now() + interval '5 days', now() + interval '35 days',
    false, false
  ),
  -- 7. UPCOMING: Cybersecurity & Web Defense
  (
    '10000000-0000-4000-8000-000000000007',
    'Cybersecurity & Web Defense',
    'Learn how to defend applications against XSS, CSRF, SQL injection, and cryptanalysis.',
    'Security',
    'Upcoming competitive security tournament. Attempts open on scheduled start date.',
    2, 30, 600,
    now() + interval '7 days', now() + interval '37 days',
    false, false
  ),
  -- 8. UPCOMING: AI & Machine Learning Primer
  (
    '10000000-0000-4000-8000-000000000008',
    'AI & Machine Learning Primer',
    'A beginner-friendly overview of supervised learning, transformer architectures, and LLMs.',
    'Artificial Intelligence',
    'Preview upcoming quiz. Score verified on leaderboard upon release.',
    2, 30, 300,
    now() + interval '10 days', now() + interval '40 days',
    false, false
  ),
  -- 9. FINISHED: History of Computing & Tech Trivia
  (
    '10000000-0000-4000-8000-000000000009',
    'History of Computing & Tech Trivia',
    'A retrospective journey covering computing pioneers, early mechanical calculators, and tech folklore.',
    'General Tech',
    'This quiz availability window has ended. Past results and leaderboard remain viewable.',
    2, 30, 300,
    now() - interval '40 days', now() - interval '5 days',
    false, false
  ),
  -- 10. FINISHED: Git & Collaborative Workflows
  (
    '10000000-0000-4000-8000-000000000010',
    'Git & Collaborative Workflows',
    'An archive quiz covering version control, branching strategies, rebase vs merge, and commit hygiene.',
    'Software Tools',
    'This quiz has concluded. Review archived rankings and solution keys.',
    2, 30, 450,
    now() - interval '40 days', now() - interval '3 days',
    false, false
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  instructions = EXCLUDED.instructions,
  marks_per_question = EXCLUDED.marks_per_question,
  seconds_per_question = EXCLUDED.seconds_per_question,
  duration_seconds = EXCLUDED.duration_seconds,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  is_published = false,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

-- Delete previous sample questions for these 10 quizzes so re-running is 100% clean
DELETE FROM public.questions WHERE quiz_id IN (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006',
  '10000000-0000-4000-8000-000000000007',
  '10000000-0000-4000-8000-000000000008',
  '10000000-0000-4000-8000-000000000009',
  '10000000-0000-4000-8000-000000000010'
);

-- 2. Insert 50 Questions (5 for each of the 10 quizzes)
INSERT INTO public.questions (id, quiz_id, text, position, explanation)
VALUES
  -- Quiz 1 Questions (Web Foundations)
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Which markup language is responsible for defining the semantic structure of a web page?', 1, 'HTML (HyperText Markup Language) defines the fundamental structure, headings, paragraphs, and elements of web pages.'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Which protocol encrypts web traffic using TLS to ensure private and secure data transfer?', 2, 'HTTPS (Hypertext Transfer Protocol Secure) provides end-to-end encryption using Transport Layer Security (TLS).'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'In the standard CSS box model, which layer sits immediately inside the border around content?', 3, 'Padding clears an area around the content and sits directly between the element content and its border.'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'What does the browser acronym "DOM" stand for?', 4, 'DOM stands for Document Object Model, which represents HTML documents as an interactive tree of objects in memory.'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'Which standard HTTP status code signifies that a new resource was successfully created on the server?', 5, 'HTTP 201 Created indicates that the request has been fulfilled and resulted in one or more new resources being created.'),

  -- Quiz 2 Questions (Database Essentials)
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', 'What is the primary role of a primary key constraint in a relational database table?', 1, 'A primary key uniquely identifies each row in a database table and enforces uniqueness and non-null values.'),
  ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', 'Which SQL clause is specifically used to filter rows after an aggregation (GROUP BY) has been calculated?', 2, 'The HAVING clause filters aggregated groups, whereas WHERE filters individual rows before aggregation occurs.'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', 'In database ACID properties, which property ensures that committed transactions survive power loss or system crashes?', 3, 'Durability guarantees that once a transaction has committed, its changes will remain permanent even across power failures.'),
  ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000002', 'Which JOIN type returns all records from both tables, filling with NULL values where no corresponding match exists?', 4, 'FULL OUTER JOIN combines the results of both LEFT and RIGHT joins, including non-matching rows with NULLs.'),
  ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000002', 'What tree-based index structure is standard in PostgreSQL and MySQL for fast range and equality queries?', 5, 'B-Tree (Balanced Tree) is the default and most widely used index structure for logarithmic lookup and range scans.'),

  -- Quiz 3 Questions (Modern JavaScript & TypeScript)
  ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', 'What is a closure in JavaScript?', 1, 'A closure is the combination of a function bundled together with references to its surrounding lexical environment.'),
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000003', 'What is the legacy result of running `typeof null` in standard JavaScript?', 2, 'typeof null returns "object", which is a historical quirk in the original JavaScript 1.0 implementation.'),
  ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000003', 'Which Promise utility method waits for all promises in an iterable to settle regardless of whether they resolve or reject?', 3, 'Promise.allSettled() returns a promise that fulfills after all of the given promises have either fulfilled or rejected.'),
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000003', 'In TypeScript, which type operator produces a string or numeric literal union of keys from an object type?', 4, 'The keyof operator takes an object type and produces a string or numeric literal union of its declared keys.'),
  ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000003', 'Which engine mechanism coordinates asynchronous tasks, microtasks (Promises), and rendering in the browser?', 5, 'The Event Loop continuously monitors the call stack, microtask queue, and task queue to orchestrate execution.'),

  -- Quiz 4 Questions (React & Next.js Architecture)
  ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000004', 'In the Next.js App Router, components inside the app directory are by default:', 1, 'By default in Next.js App Router, all components inside the app folder are React Server Components (RSC).'),
  ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000004', 'Which React 18+ hook is designed to read and subscribe to external stores safely without hydration mismatches?', 2, 'useSyncExternalStore is recommended for reading from external mutable sources like browser storage or stores.'),
  ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000004', 'What special file name in Next.js App Router acts as an error boundary for a route segment and its children?', 3, 'error.tsx defines an Error Boundary component that gracefully isolates and catches errors in a route segment.'),
  ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000004', 'What does React use under the hood to compare values in hook dependency arrays like useEffect and useMemo?', 4, 'React uses Object.is() shallow reference equality to determine if dependencies changed between renders.'),
  ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000004', 'What directive must be placed at the very top of a file to declare a Client Component in Next.js?', 5, 'The "use client" directive marks the boundary between the server and client component module graph.'),

  -- Quiz 5 Questions (Data Structures & Algorithms)
  ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000005', 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?', 1, 'In a balanced BST with n nodes, halving the search space at each level results in O(log n) average search time.'),
  ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000005', 'Which fundamental data structure operates under the First-In-First-Out (FIFO) principle?', 2, 'A Queue processes elements in the order they arrive (First In, First Out), unlike a Stack which is LIFO.'),
  ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000005', 'Which comparison-based sorting algorithm guarantees O(n log n) time complexity in the worst-case scenario?', 3, 'Merge Sort divides the array into halves and merges them, guaranteeing O(n log n) even in worst-case order.'),
  ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000005', 'In a hash table collision resolution, what is the name of the technique that stores collided keys in a linked list at each bucket?', 4, 'Separate Chaining resolves hash collisions by maintaining a linked list of key-value pairs at each hash slot.'),
  ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000005', 'Which graph traversal algorithm uses a FIFO Queue to visit neighbors level-by-level from the source node?', 5, 'Breadth-First Search (BFS) explores all vertices at the present depth before moving on to vertices at the next depth.'),

  -- Quiz 6 Questions (Cloud & DevOps Fundamentals - Upcoming)
  ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000006', 'What is the primary architectural difference between Docker containers and Virtual Machines?', 1, 'Containers share the host operating system kernel and isolate at process level, while VMs include a full guest OS.'),
  ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000006', 'Which DNS record type maps a human-readable domain name directly to a 32-bit IPv4 address?', 2, 'An A (Address) record maps a domain name directly to its corresponding IPv4 address.'),
  ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000006', 'What does the acronym "CI/CD" stand for in modern automated software pipelines?', 3, 'CI/CD stands for Continuous Integration and Continuous Delivery (or Continuous Deployment).'),
  ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000006', 'Which cloud execution model allows developers to execute event-triggered code without provisioning or managing servers?', 4, 'Serverless (or FaaS - Function-as-a-Service) executes code in stateless compute containers triggered by events.'),
  ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000006', 'Which HTTP response header tells browser and CDN edge caches the maximum age (in seconds) a response remains fresh?', 5, 'Cache-Control (e.g. max-age=3600) dictates caching directives for both browser and intermediary proxy caches.'),

  -- Quiz 7 Questions (Cybersecurity & Web Defense - Upcoming)
  ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000007', 'What type of web attack tricks an authenticated user into unknowingly submitting malicious requests to a web application?', 1, 'Cross-Site Request Forgery (CSRF) tricks a victims browser into executing unwanted actions on an app where they are authenticated.'),
  ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000007', 'What is the most effective primary defense against SQL Injection vulnerabilities?', 2, 'Parameterized queries (Prepared Statements) ensure user inputs are treated as literal data rather than executable SQL code.'),
  ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000007', 'Which HTTP security header restricts the origins from which scripts, images, and styles can be loaded on a webpage?', 3, 'Content-Security-Policy (CSP) restricts allowed resource domains and prevents Cross-Site Scripting (XSS).'),
  ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000007', 'In cryptography, what distinguishes asymmetric encryption from symmetric encryption?', 4, 'Asymmetric encryption uses a public key for encryption and a distinct private key for decryption, while symmetric uses one shared key.'),
  ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000007', 'What does the acronym "MFA" stand for in authentication systems?', 5, 'MFA stands for Multi-Factor Authentication, requiring two or more verification factors to gain access.'),

  -- Quiz 8 Questions (AI & Machine Learning - Upcoming)
  ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000008', 'Which type of machine learning algorithms train models using datasets that contain labeled input-output pairs?', 1, 'Supervised Learning uses labeled training data to learn mapping functions between input features and target labels.'),
  ('20000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000008', 'What does the acronym "LLM" stand for in modern generative artificial intelligence?', 2, 'LLM stands for Large Language Model, neural network models trained on extensive text datasets.'),
  ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000008', 'Which activation function maps real numbers into the range [0, 1], commonly used for binary probability outputs?', 3, 'The Sigmoid function transforms arbitrary real inputs into probability values between 0 and 1.'),
  ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000008', 'In modern Transformer neural networks, what does the "Self-Attention" mechanism calculate?', 4, 'Self-attention calculates contextual weights between all pairs of tokens in a sequence to capture long-range relationships.'),
  ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000008', 'What is "overfitting" in machine learning?', 5, 'Overfitting occurs when a model learns training data details and noise too closely, failing to generalize to unseen test data.'),

  -- Quiz 9 Questions (History of Computing - Finished)
  ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000009', 'Who is recognized as the worlds first computer programmer for writing an algorithm for Charles Babbages Analytical Engine?', 1, 'Ada Lovelace wrote the first published computer algorithm intended for machine execution in 1843.'),
  ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000009', 'Where did the famous physical term "computer bug" originate in modern computing folklore?', 2, 'In 1947, engineers at Harvard found an actual moth stuck between relays in the Mark II computer and taped it to the logbook.'),
  ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000009', 'Who originally created the free and open-source Linux operating system kernel in 1991?', 3, 'Finnish computer science student Linus Torvalds released the Linux kernel v0.01 in September 1991.'),
  ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000009', 'What was the Python programming language named after by its creator Guido van Rossum?', 4, 'Guido van Rossum named Python after the British comedy show Monty Pythons Flying Circus, which he enjoyed reading.'),
  ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000009', 'What was the first commercially successful personal computer to popularize the graphical user interface (GUI) and mouse in 1984?', 5, 'The Apple Macintosh (1984) was the first mass-market personal computer with a built-in GUI and mouse interface.'),

  -- Quiz 10 Questions (Git & Collaborative Workflows - Finished)
  ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000010', 'Which Git command creates a new branch and immediately switches your working directory to it in one step?', 1, 'git checkout -b <branch_name> (or modern: git switch -c <branch_name>) creates and switches to a new branch in one command.'),
  ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000010', 'What is the primary difference between `git merge` and `git rebase`?', 2, 'Merge joins branch histories by creating a new merge commit, whereas rebase rewrites commits linearly on top of the target base.'),
  ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000010', 'Which command allows developers to temporarily stash uncommitted dirty changes without making a commit?', 3, 'git stash shelves modified tracked files and staged changes, reverting your working directory to match the HEAD commit.'),
  ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000010', 'In Git terms, what is a "fast-forward" merge?', 4, 'A fast-forward merge occurs when there are no divergent commits on the target branch, allowing the branch pointer to simply move forward.'),
  ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000010', 'In Git internals, what does the special reference `HEAD` represent?', 5, 'HEAD is a symbolic reference that points to the currently checked-out branch or commit in your working repository.')
ON CONFLICT (id) DO UPDATE SET
  quiz_id = EXCLUDED.quiz_id,
  text = EXCLUDED.text,
  position = EXCLUDED.position,
  explanation = EXCLUDED.explanation;

-- 3. Insert 200 Options (4 options for each of the 50 questions, exactly 1 correct each)
INSERT INTO public.question_options (id, question_id, text, is_correct, position)
VALUES
  -- Q1 Options (HTML)
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'HTML (HyperText Markup Language)', true, 1),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'CSS (Cascading Style Sheets)', false, 2),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'JSON (JavaScript Object Notation)', false, 3),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 'SQL (Structured Query Language)', false, 4),

  -- Q2 Options (HTTPS)
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'FTP', false, 1),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', 'HTTPS', true, 2),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000002', 'SMTP', false, 3),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000002', 'Telnet', false, 4),

  -- Q3 Options (Padding)
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000003', 'Margin', false, 1),
  ('30000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000003', 'Padding', true, 2),
  ('30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000003', 'Outline', false, 3),
  ('30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000003', 'Gap', false, 4),

  -- Q4 Options (DOM)
  ('30000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000004', 'Document Object Model', true, 1),
  ('30000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000004', 'Data Output Method', false, 2),
  ('30000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000004', 'Direct Operating Module', false, 3),
  ('30000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000004', 'Distributed Object Manager', false, 4),

  -- Q5 Options (201 Created)
  ('30000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000005', '200 OK', false, 1),
  ('30000000-0000-4000-8000-000000000018', '20000000-0000-4000-8000-000000000005', '201 Created', true, 2),
  ('30000000-0000-4000-8000-000000000019', '20000000-0000-4000-8000-000000000005', '204 No Content', false, 3),
  ('30000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000005', '301 Moved Permanently', false, 4),

  -- Q6 Options (Primary Key)
  ('30000000-0000-4000-8000-000000000021', '20000000-0000-4000-8000-000000000006', 'Uniquely identifies each record/row in a table', true, 1),
  ('30000000-0000-4000-8000-000000000022', '20000000-0000-4000-8000-000000000006', 'Allows duplicate values across all rows', false, 2),
  ('30000000-0000-4000-8000-000000000023', '20000000-0000-4000-8000-000000000006', 'Stores encrypted database passwords', false, 3),
  ('30000000-0000-4000-8000-000000000024', '20000000-0000-4000-8000-000000000006', 'Connects external web services to the database', false, 4),

  -- Q7 Options (HAVING)
  ('30000000-0000-4000-8000-000000000025', '20000000-0000-4000-8000-000000000007', 'WHERE', false, 1),
  ('30000000-0000-4000-8000-000000000026', '20000000-0000-4000-8000-000000000007', 'HAVING', true, 2),
  ('30000000-0000-4000-8000-000000000027', '20000000-0000-4000-8000-000000000007', 'ORDER BY', false, 3),
  ('30000000-0000-4000-8000-000000000028', '20000000-0000-4000-8000-000000000007', 'DISTINCT', false, 4),

  -- Q8 Options (Durability)
  ('30000000-0000-4000-8000-000000000029', '20000000-0000-4000-8000-000000000008', 'Atomicity', false, 1),
  ('30000000-0000-4000-8000-000000000030', '20000000-0000-4000-8000-000000000008', 'Consistency', false, 2),
  ('30000000-0000-4000-8000-000000000031', '20000000-0000-4000-8000-000000000008', 'Isolation', false, 3),
  ('30000000-0000-4000-8000-000000000032', '20000000-0000-4000-8000-000000000008', 'Durability', true, 4),

  -- Q9 Options (FULL OUTER JOIN)
  ('30000000-0000-4000-8000-000000000033', '20000000-0000-4000-8000-000000000009', 'INNER JOIN', false, 1),
  ('30000000-0000-4000-8000-000000000034', '20000000-0000-4000-8000-000000000009', 'CROSS JOIN', false, 2),
  ('30000000-0000-4000-8000-000000000035', '20000000-0000-4000-8000-000000000009', 'FULL OUTER JOIN', true, 3),
  ('30000000-0000-4000-8000-000000000036', '20000000-0000-4000-8000-000000000009', 'LEFT JOIN', false, 4),

  -- Q10 Options (B-Tree)
  ('30000000-0000-4000-8000-000000000037', '20000000-0000-4000-8000-000000000010', 'B-Tree', true, 1),
  ('30000000-0000-4000-8000-000000000038', '20000000-0000-4000-8000-000000000010', 'Hash List', false, 2),
  ('30000000-0000-4000-8000-000000000039', '20000000-0000-4000-8000-000000000010', 'Linked Array', false, 3),
  ('30000000-0000-4000-8000-000000000040', '20000000-0000-4000-8000-000000000010', 'Circular Buffer', false, 4),

  -- Q11 Options (Closure)
  ('30000000-0000-4000-8000-000000000041', '20000000-0000-4000-8000-000000000011', 'A function bundled with its lexical environment', true, 1),
  ('30000000-0000-4000-8000-000000000042', '20000000-0000-4000-8000-000000000011', 'A method that forces garbage collection', false, 2),
  ('30000000-0000-4000-8000-000000000043', '20000000-0000-4000-8000-000000000011', 'A syntax error during JSON parsing', false, 3),
  ('30000000-0000-4000-8000-000000000044', '20000000-0000-4000-8000-000000000011', 'A strictly private HTML comment tag', false, 4),

  -- Q12 Options (typeof null)
  ('30000000-0000-4000-8000-000000000045', '20000000-0000-4000-8000-000000000012', '"null"', false, 1),
  ('30000000-0000-4000-8000-000000000046', '20000000-0000-4000-8000-000000000012', '"undefined"', false, 2),
  ('30000000-0000-4000-8000-000000000047', '20000000-0000-4000-8000-000000000012', '"object"', true, 3),
  ('30000000-0000-4000-8000-000000000048', '20000000-0000-4000-8000-000000000012', '"boolean"', false, 4),

  -- Q13 Options (Promise.allSettled)
  ('30000000-0000-4000-8000-000000000049', '20000000-0000-4000-8000-000000000013', 'Promise.race()', false, 1),
  ('30000000-0000-4000-8000-000000000050', '20000000-0000-4000-8000-000000000013', 'Promise.allSettled()', true, 2),
  ('30000000-0000-4000-8000-000000000051', '20000000-0000-4000-8000-000000000013', 'Promise.any()', false, 3),
  ('30000000-0000-4000-8000-000000000052', '20000000-0000-4000-8000-000000000013', 'Promise.resolve()', false, 4),

  -- Q14 Options (keyof)
  ('30000000-0000-4000-8000-000000000053', '20000000-0000-4000-8000-000000000014', 'typeof', false, 1),
  ('30000000-0000-4000-8000-000000000054', '20000000-0000-4000-8000-000000000014', 'keyof', true, 2),
  ('30000000-0000-4000-8000-000000000055', '20000000-0000-4000-8000-000000000014', 'instanceof', false, 3),
  ('30000000-0000-4000-8000-000000000056', '20000000-0000-4000-8000-000000000014', 'infer', false, 4),

  -- Q15 Options (Event Loop)
  ('30000000-0000-4000-8000-000000000057', '20000000-0000-4000-8000-000000000015', 'Event Loop', true, 1),
  ('30000000-0000-4000-8000-000000000058', '20000000-0000-4000-8000-000000000015', 'Compiler Optimizer', false, 2),
  ('30000000-0000-4000-8000-000000000059', '20000000-0000-4000-8000-000000000015', 'Service Worker Thread', false, 3),
  ('30000000-0000-4000-8000-000000000060', '20000000-0000-4000-8000-000000000015', 'Garbage Collector', false, 4),

  -- Q16 Options (Server Components)
  ('30000000-0000-4000-8000-000000000061', '20000000-0000-4000-8000-000000000016', 'Client Components', false, 1),
  ('30000000-0000-4000-8000-000000000062', '20000000-0000-4000-8000-000000000016', 'React Server Components (RSC)', true, 2),
  ('30000000-0000-4000-8000-000000000063', '20000000-0000-4000-8000-000000000016', 'Pure HTML Web Components', false, 3),
  ('30000000-0000-4000-8000-000000000064', '20000000-0000-4000-8000-000000000016', 'Stateless Class Components', false, 4),

  -- Q17 Options (useSyncExternalStore)
  ('30000000-0000-4000-8000-000000000065', '20000000-0000-4000-8000-000000000017', 'useEffect', false, 1),
  ('30000000-0000-4000-8000-000000000066', '20000000-0000-4000-8000-000000000017', 'useSyncExternalStore', true, 2),
  ('30000000-0000-4000-8000-000000000067', '20000000-0000-4000-8000-000000000017', 'useLayoutEffect', false, 3),
  ('30000000-0000-4000-8000-000000000068', '20000000-0000-4000-8000-000000000017', 'useImperativeHandle', false, 4),

  -- Q18 Options (error.tsx)
  ('30000000-0000-4000-8000-000000000069', '20000000-0000-4000-8000-000000000018', 'error.tsx', true, 1),
  ('30000000-0000-4000-8000-000000000070', '20000000-0000-4000-8000-000000000018', 'catch.tsx', false, 2),
  ('30000000-0000-4000-8000-000000000071', '20000000-0000-4000-8000-000000000018', 'exception.tsx', false, 3),
  ('30000000-0000-4000-8000-000000000072', '20000000-0000-4000-8000-000000000018', 'boundary.tsx', false, 4),

  -- Q19 Options (Object.is)
  ('30000000-0000-4000-8000-000000000073', '20000000-0000-4000-8000-000000000019', 'Deep recursive object comparison', false, 1),
  ('30000000-0000-4000-8000-000000000074', '20000000-0000-4000-8000-000000000019', 'Shallow reference equality (Object.is)', true, 2),
  ('30000000-0000-4000-8000-000000000075', '20000000-0000-4000-8000-000000000019', 'JSON string comparison', false, 3),
  ('30000000-0000-4000-8000-000000000076', '20000000-0000-4000-8000-000000000019', 'Memory address pointer hashing', false, 4),

  -- Q20 Options (use client)
  ('30000000-0000-4000-8000-000000000077', '20000000-0000-4000-8000-000000000020', '"use client"', true, 1),
  ('30000000-0000-4000-8000-000000000078', '20000000-0000-4000-8000-000000000020', '"use browser"', false, 2),
  ('30000000-0000-4000-8000-000000000079', '20000000-0000-4000-8000-000000000020', '"client-only"', false, 3),
  ('30000000-0000-4000-8000-000000000080', '20000000-0000-4000-8000-000000000020', '"client side"', false, 4),

  -- Q21 Options (O(log n))
  ('30000000-0000-4000-8000-000000000081', '20000000-0000-4000-8000-000000000021', 'O(1)', false, 1),
  ('30000000-0000-4000-8000-000000000082', '20000000-0000-4000-8000-000000000021', 'O(log n)', true, 2),
  ('30000000-0000-4000-8000-000000000083', '20000000-0000-4000-8000-000000000021', 'O(n)', false, 3),
  ('30000000-0000-4000-8000-000000000084', '20000000-0000-4000-8000-000000000021', 'O(n²)', false, 4),

  -- Q22 Options (Queue)
  ('30000000-0000-4000-8000-000000000085', '20000000-0000-4000-8000-000000000022', 'Stack', false, 1),
  ('30000000-0000-4000-8000-000000000086', '20000000-0000-4000-8000-000000000022', 'Queue', true, 2),
  ('30000000-0000-4000-8000-000000000087', '20000000-0000-4000-8000-000000000022', 'Binary Heap', false, 3),
  ('30000000-0000-4000-8000-000000000088', '20000000-0000-4000-8000-000000000022', 'Red-Black Tree', false, 4),

  -- Q23 Options (Merge Sort)
  ('30000000-0000-4000-8000-000000000089', '20000000-0000-4000-8000-000000000023', 'Quick Sort', false, 1),
  ('30000000-0000-4000-8000-000000000090', '20000000-0000-4000-8000-000000000023', 'Bubble Sort', false, 2),
  ('30000000-0000-4000-8000-000000000091', '20000000-0000-4000-8000-000000000023', 'Merge Sort', true, 3),
  ('30000000-0000-4000-8000-000000000092', '20000000-0000-4000-8000-000000000023', 'Insertion Sort', false, 4),

  -- Q24 Options (Separate Chaining)
  ('30000000-0000-4000-8000-000000000093', '20000000-0000-4000-8000-000000000024', 'Linear Probing', false, 1),
  ('30000000-0000-4000-8000-000000000094', '20000000-0000-4000-8000-000000000024', 'Separate Chaining', true, 2),
  ('30000000-0000-4000-8000-000000000095', '20000000-0000-4000-8000-000000000024', 'Double Hashing', false, 3),
  ('30000000-0000-4000-8000-000000000096', '20000000-0000-4000-8000-000000000024', 'Quadratic Probing', false, 4),

  -- Q25 Options (BFS)
  ('30000000-0000-4000-8000-000000000097', '20000000-0000-4000-8000-000000000025', 'Depth-First Search (DFS)', false, 1),
  ('30000000-0000-4000-8000-000000000098', '20000000-0000-4000-8000-000000000025', 'Breadth-First Search (BFS)', true, 2),
  ('30000000-0000-4000-8000-000000000099', '20000000-0000-4000-8000-000000000025', 'Dijkstra with Priority Queue', false, 3),
  ('30000000-0000-4000-8000-000000000100', '20000000-0000-4000-8000-000000000025', 'Bellman-Ford Algorithm', false, 4),

  -- Q26 Options (Docker vs VM)
  ('30000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000000026', 'Containers share the host OS kernel and isolate at process level', true, 1),
  ('30000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000026', 'Virtual Machines cannot run Linux images', false, 2),
  ('30000000-0000-4000-8000-000000000103', '20000000-0000-4000-8000-000000000026', 'Containers require hypervisors to emulate physical BIOS', false, 3),
  ('30000000-0000-4000-8000-000000000104', '20000000-0000-4000-8000-000000000026', 'Docker cannot run on Windows or macOS', false, 4),

  -- Q27 Options (A Record)
  ('30000000-0000-4000-8000-000000000105', '20000000-0000-4000-8000-000000000027', 'CNAME Record', false, 1),
  ('30000000-0000-4000-8000-000000000106', '20000000-0000-4000-8000-000000000027', 'A Record', true, 2),
  ('30000000-0000-4000-8000-000000000107', '20000000-0000-4000-8000-000000000027', 'MX Record', false, 3),
  ('30000000-0000-4000-8000-000000000108', '20000000-0000-4000-8000-000000000027', 'TXT Record', false, 4),

  -- Q28 Options (CI/CD)
  ('30000000-0000-4000-8000-000000000109', '20000000-0000-4000-8000-000000000028', 'Continuous Integration / Continuous Delivery', true, 1),
  ('30000000-0000-4000-8000-000000000110', '20000000-0000-4000-8000-000000000028', 'Cloud Infrastructure / Container Deployment', false, 2),
  ('30000000-0000-4000-8000-000000000111', '20000000-0000-4000-8000-000000000028', 'Compiled Instruction / Code Documentation', false, 3),
  ('30000000-0000-4000-8000-000000000112', '20000000-0000-4000-8000-000000000028', 'Central Interface / Data Controller', false, 4),

  -- Q29 Options (Serverless / FaaS)
  ('30000000-0000-4000-8000-000000000113', '20000000-0000-4000-8000-000000000029', 'IaaS (Infrastructure-as-a-Service)', false, 1),
  ('30000000-0000-4000-8000-000000000114', '20000000-0000-4000-8000-000000000029', 'Serverless / FaaS (Function-as-a-Service)', true, 2),
  ('30000000-0000-4000-8000-000000000115', '20000000-0000-4000-8000-000000000029', 'Bare Metal Colocation', false, 3),
  ('30000000-0000-4000-8000-000000000116', '20000000-0000-4000-8000-000000000029', 'VPN Gateway Hosting', false, 4),

  -- Q30 Options (Cache-Control)
  ('30000000-0000-4000-8000-000000000117', '20000000-0000-4000-8000-000000000030', 'Content-Type', false, 1),
  ('30000000-0000-4000-8000-000000000118', '20000000-0000-4000-8000-000000000030', 'Cache-Control', true, 2),
  ('30000000-0000-4000-8000-000000000119', '20000000-0000-4000-8000-000000000030', 'X-Forwarded-For', false, 3),
  ('30000000-0000-4000-8000-000000000120', '20000000-0000-4000-8000-000000000030', 'Access-Control-Allow-Origin', false, 4),

  -- Q31 Options (CSRF)
  ('30000000-0000-4000-8000-000000000121', '20000000-0000-4000-8000-000000000031', 'CSRF (Cross-Site Request Forgery)', true, 1),
  ('30000000-0000-4000-8000-000000000122', '20000000-0000-4000-8000-000000000031', 'SQL Injection', false, 2),
  ('30000000-0000-4000-8000-000000000123', '20000000-0000-4000-8000-000000000031', 'Buffer Overflow', false, 3),
  ('30000000-0000-4000-8000-000000000124', '20000000-0000-4000-8000-000000000031', 'DDoS Amplification', false, 4),

  -- Q32 Options (Parameterized Queries)
  ('30000000-0000-4000-8000-000000000125', '20000000-0000-4000-8000-000000000032', 'Direct string concatenation into SQL queries', false, 1),
  ('30000000-0000-4000-8000-000000000126', '20000000-0000-4000-8000-000000000032', 'Parameterized Queries / Prepared Statements', true, 2),
  ('30000000-0000-4000-8000-000000000127', '20000000-0000-4000-8000-000000000032', 'Disabling database indexes', false, 3),
  ('30000000-0000-4000-8000-000000000128', '20000000-0000-4000-8000-000000000032', 'Writing passwords in plain text', false, 4),

  -- Q33 Options (CSP)
  ('30000000-0000-4000-8000-000000000129', '20000000-0000-4000-8000-000000000033', 'X-Frame-Options', false, 1),
  ('30000000-0000-4000-8000-000000000130', '20000000-0000-4000-8000-000000000033', 'Content-Security-Policy (CSP)', true, 2),
  ('30000000-0000-4000-8000-000000000131', '20000000-0000-4000-8000-000000000033', 'Strict-Transport-Security (HSTS)', false, 3),
  ('30000000-0000-4000-8000-000000000132', '20000000-0000-4000-8000-000000000033', 'Referrer-Policy', false, 4),

  -- Q34 Options (Asymmetric vs Symmetric)
  ('30000000-0000-4000-8000-000000000133', '20000000-0000-4000-8000-000000000034', 'Asymmetric uses public and private key pairs; symmetric uses a shared secret', true, 1),
  ('30000000-0000-4000-8000-000000000134', '20000000-0000-4000-8000-000000000034', 'Symmetric encryption cannot be decrypted once applied', false, 2),
  ('30000000-0000-4000-8000-000000000135', '20000000-0000-4000-8000-000000000034', 'Asymmetric algorithms run faster than symmetric algorithms', false, 3),
  ('30000000-0000-4000-8000-000000000136', '20000000-0000-4000-8000-000000000034', 'Neither supports secure transmission over HTTPS', false, 4),

  -- Q35 Options (MFA)
  ('30000000-0000-4000-8000-000000000137', '20000000-0000-4000-8000-000000000035', 'Multi-Factor Authentication', true, 1),
  ('30000000-0000-4000-8000-000000000138', '20000000-0000-4000-8000-000000000035', 'Mainframe Access protocol', false, 2),
  ('30000000-0000-4000-8000-000000000139', '20000000-0000-4000-8000-000000000035', 'Mandatory File Access', false, 3),
  ('30000000-0000-4000-8000-000000000140', '20000000-0000-4000-8000-000000000035', 'Master Firewall Architecture', false, 4),

  -- Q36 Options (Supervised Learning)
  ('30000000-0000-4000-8000-000000000141', '20000000-0000-4000-8000-000000000036', 'Supervised Learning', true, 1),
  ('30000000-0000-4000-8000-000000000142', '20000000-0000-4000-8000-000000000036', 'Unsupervised Clustering', false, 2),
  ('30000000-0000-4000-8000-000000000143', '20000000-0000-4000-8000-000000000036', 'Pure Reinforcement Learning', false, 3),
  ('30000000-0000-4000-8000-000000000144', '20000000-0000-4000-8000-000000000036', 'Heuristic Brute Force', false, 4),

  -- Q37 Options (LLM)
  ('30000000-0000-4000-8000-000000000145', '20000000-0000-4000-8000-000000000037', 'Linear Logic Matrix', false, 1),
  ('30000000-0000-4000-8000-000000000146', '20000000-0000-4000-8000-000000000037', 'Large Language Model', true, 2),
  ('30000000-0000-4000-8000-000000000147', '20000000-0000-4000-8000-000000000037', 'Low Latency Microservice', false, 3),
  ('30000000-0000-4000-8000-000000000148', '20000000-0000-4000-8000-000000000037', 'Logarithmic Learning Method', false, 4),

  -- Q38 Options (Sigmoid)
  ('30000000-0000-4000-8000-000000000149', '20000000-0000-4000-8000-000000000038', 'ReLU (Rectified Linear Unit)', false, 1),
  ('30000000-0000-4000-8000-000000000150', '20000000-0000-4000-8000-000000000038', 'Sigmoid', true, 2),
  ('30000000-0000-4000-8000-000000000151', '20000000-0000-4000-8000-000000000038', 'Linear Step Function', false, 3),
  ('30000000-0000-4000-8000-000000000152', '20000000-0000-4000-8000-000000000038', 'Polynomial Decay', false, 4),

  -- Q39 Options (Self-Attention)
  ('30000000-0000-4000-8000-000000000153', '20000000-0000-4000-8000-000000000039', 'Weighs the relevance of different tokens relative to each other', true, 1),
  ('30000000-0000-4000-8000-000000000154', '20000000-0000-4000-8000-000000000039', 'Limits models to reading only 10 words at a time', false, 2),
  ('30000000-0000-4000-8000-000000000155', '20000000-0000-4000-8000-000000000039', 'Automatically shuts down GPU execution on thermal throttling', false, 3),
  ('30000000-0000-4000-8000-000000000156', '20000000-0000-4000-8000-000000000039', 'Translates binary assembly instructions directly into Python', false, 4),

  -- Q40 Options (Overfitting)
  ('30000000-0000-4000-8000-000000000157', '20000000-0000-4000-8000-000000000040', 'Model performs accurately on training data but fails to generalize to new data', true, 1),
  ('30000000-0000-4000-8000-000000000158', '20000000-0000-4000-8000-000000000040', 'Model training terminates prematurely due to out of memory', false, 2),
  ('30000000-0000-4000-8000-000000000159', '20000000-0000-4000-8000-000000000040', 'Model only supports numerical inputs without strings', false, 3),
  ('30000000-0000-4000-8000-000000000160', '20000000-0000-4000-8000-000000000040', 'Dataset is too small to initialize neural weights', false, 4),

  -- Q41 Options (Ada Lovelace)
  ('30000000-0000-4000-8000-000000000161', '20000000-0000-4000-8000-000000000041', 'Ada Lovelace', true, 1),
  ('30000000-0000-4000-8000-000000000162', '20000000-0000-4000-8000-000000000041', 'Alan Turing', false, 2),
  ('30000000-0000-4000-8000-000000000163', '20000000-0000-4000-8000-000000000041', 'Grace Hopper', false, 3),
  ('30000000-0000-4000-8000-000000000164', '20000000-0000-4000-8000-000000000041', 'Charles Babbage', false, 4),

  -- Q42 Options (Moth in Relay)
  ('30000000-0000-4000-8000-000000000165', '20000000-0000-4000-8000-000000000042', 'A physical moth trapped in a Mark II relay causing hardware failure', true, 1),
  ('30000000-0000-4000-8000-000000000166', '20000000-0000-4000-8000-000000000042', 'A deliberate virus planted in ARPANET protocols', false, 2),
  ('30000000-0000-4000-8000-000000000167', '20000000-0000-4000-8000-000000000042', 'A translation typo in early COBOL compilers', false, 3),
  ('30000000-0000-4000-8000-000000000168', '20000000-0000-4000-8000-000000000042', 'A fictional joke created in Bell Labs newsletters', false, 4),

  -- Q43 Options (Linus Torvalds)
  ('30000000-0000-4000-8000-000000000169', '20000000-0000-4000-8000-000000000043', 'Richard Stallman', false, 1),
  ('30000000-0000-4000-8000-000000000170', '20000000-0000-4000-8000-000000000043', 'Linus Torvalds', true, 2),
  ('30000000-0000-4000-8000-000000000171', '20000000-0000-4000-8000-000000000043', 'Dennis Ritchie', false, 3),
  ('30000000-0000-4000-8000-000000000172', '20000000-0000-4000-8000-000000000043', 'Ken Thompson', false, 4),

  -- Q44 Options (Monty Python)
  ('30000000-0000-4000-8000-000000000173', '20000000-0000-4000-8000-000000000044', 'A pet python snake owned by Guido van Rossum', false, 1),
  ('30000000-0000-4000-8000-000000000174', '20000000-0000-4000-8000-000000000044', 'British comedy sketch series "Monty Python''s Flying Circus"', true, 2),
  ('30000000-0000-4000-8000-000000000175', '20000000-0000-4000-8000-000000000044', 'A mathematical constant from Greek astronomy', false, 3),
  ('30000000-0000-4000-8000-000000000176', '20000000-0000-4000-8000-000000000044', 'An acronym for Portable Yield Threading Object Network', false, 4),

  -- Q45 Options (Apple Macintosh)
  ('30000000-0000-4000-8000-000000000177', '20000000-0000-4000-8000-000000000045', 'Commodore 64', false, 1),
  ('30000000-0000-4000-8000-000000000178', '20000000-0000-4000-8000-000000000045', 'IBM PC 5150', false, 2),
  ('30000000-0000-4000-8000-000000000179', '20000000-0000-4000-8000-000000000045', 'Apple Macintosh (1984)', true, 3),
  ('30000000-0000-4000-8000-000000000180', '20000000-0000-4000-8000-000000000045', 'Atari 2600', false, 4),

  -- Q46 Options (git checkout -b)
  ('30000000-0000-4000-8000-000000000181', '20000000-0000-4000-8000-000000000046', 'git branch <branch>', false, 1),
  ('30000000-0000-4000-8000-000000000182', '20000000-0000-4000-8000-000000000046', 'git checkout -b <branch>', true, 2),
  ('30000000-0000-4000-8000-000000000183', '20000000-0000-4000-8000-000000000046', 'git switch <branch>', false, 3),
  ('30000000-0000-4000-8000-000000000184', '20000000-0000-4000-8000-000000000046', 'git merge <branch>', false, 4),

  -- Q47 Options (Merge vs Rebase)
  ('30000000-0000-4000-8000-000000000185', '20000000-0000-4000-8000-000000000047', 'Merge creates a merge commit preserving history; rebase reapplies commits linearly on the base', true, 1),
  ('30000000-0000-4000-8000-000000000186', '20000000-0000-4000-8000-000000000047', 'Rebase can only be used on GitHub, while merge is local only', false, 2),
  ('30000000-0000-4000-8000-000000000187', '20000000-0000-4000-8000-000000000047', 'Merge permanently deletes untracked files', false, 3),
  ('30000000-0000-4000-8000-000000000188', '20000000-0000-4000-8000-000000000047', 'They are exact aliases of the same underlying command', false, 4),

  -- Q48 Options (git stash)
  ('30000000-0000-4000-8000-000000000189', '20000000-0000-4000-8000-000000000048', 'git stash', true, 1),
  ('30000000-0000-4000-8000-000000000190', '20000000-0000-4000-8000-000000000048', 'git clean -fd', false, 2),
  ('30000000-0000-4000-8000-000000000191', '20000000-0000-4000-8000-000000000048', 'git reset --hard', false, 3),
  ('30000000-0000-4000-8000-000000000192', '20000000-0000-4000-8000-000000000048', 'git commit --amend', false, 4),

  -- Q49 Options (Fast-forward)
  ('30000000-0000-4000-8000-000000000193', '20000000-0000-4000-8000-000000000049', 'A merge where target branch has no divergent commits so the tip pointer simply advances', true, 1),
  ('30000000-0000-4000-8000-000000000194', '20000000-0000-4000-8000-000000000049', 'A merge that runs in under 1 millisecond', false, 2),
  ('30000000-0000-4000-8000-000000000195', '20000000-0000-4000-8000-000000000049', 'A merge that skips code verification tests', false, 3),
  ('30000000-0000-4000-8000-000000000196', '20000000-0000-4000-8000-000000000049', 'A merge performed automatically by remote GitHub webhooks', false, 4),

  -- Q50 Options (HEAD pointer)
  ('30000000-0000-4000-8000-000000000197', '20000000-0000-4000-8000-000000000050', 'A pointer reference to the currently checked-out branch or commit', true, 1),
  ('30000000-0000-4000-8000-000000000198', '20000000-0000-4000-8000-000000000050', 'The remote server URL of the origin repository', false, 2),
  ('30000000-0000-4000-8000-000000000199', '20000000-0000-4000-8000-000000000050', 'The very first initial commit in repository history', false, 3),
  ('30000000-0000-4000-8000-000000000200', '20000000-0000-4000-8000-000000000050', 'The GitHub API authentication token header', false, 4)
ON CONFLICT (id) DO UPDATE SET
  question_id = EXCLUDED.question_id,
  text = EXCLUDED.text,
  is_correct = EXCLUDED.is_correct,
  position = EXCLUDED.position;

-- 4. Now safely publish all quizzes (triggers validate_quiz_before_publish which now sees exactly 1 correct option per question)
UPDATE public.quizzes
SET is_published = true
WHERE id IN (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006',
  '10000000-0000-4000-8000-000000000007',
  '10000000-0000-4000-8000-000000000008',
  '10000000-0000-4000-8000-000000000009',
  '10000000-0000-4000-8000-000000000010'
);

COMMIT;
