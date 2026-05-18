-- Optional: Disable foreign key checks if you want to truncate the tables first
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE tasks;
-- TRUNCATE TABLE notepads;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users (6 instances)
INSERT INTO users (id, username, email, hashed_password, is_active) VALUES
(1, 'alice_smith', 'alice@example.com', 'hashed_pw_1', 1),
(2, 'bob_jones', 'bob@example.com', 'hashed_pw_2', 1),
(3, 'charlie_brown', 'charlie@example.com', 'hashed_pw_3', 1),
(4, 'diana_prince', 'diana@example.com', 'hashed_pw_4', 1),
(5, 'evan_wright', 'evan@example.com', 'hashed_pw_5', 1),
(6, 'fiona_gallagher', 'fiona@example.com', 'hashed_pw_6', 1);

-- 2. Notepads (2 per user = 12 instances)
INSERT INTO notepads (id, user_id, title) VALUES
(1, 1, 'Groceries & Meal Prep'),
(2, 1, 'Q3 OKR Planning'),
(3, 2, 'Home Renovation Ideas'),
(4, 2, 'Book Recommendations'),
(5, 3, 'Weekend Trip Itinerary'),
(6, 3, 'Daily Standup Notes'),
(7, 4, 'Workout Routine'),
(8, 4, 'Tech Stack Research'),
(9, 5, 'Birthday Party Planning'),
(10, 5, 'Client Meeting Agendas'),
(11, 6, 'Freelance Projects'),
(12, 6, 'Garden Maintenance');

-- 3. Tasks (6 per notepad = 72 instances)
-- Note: 'checked' and 'flagged' are booleans (0 or 1)
-- 'mode' is an ENUM ('checkbox', 'list')
INSERT INTO tasks (id, notepad_id, label, checked, flagged, mode) VALUES

-- Notepad 1: Groceries & Meal Prep
(1, 1, 'Buy organic spinach', 0, 1, 'checkbox'),
(2, 1, 'Almond milk', 1, 0, 'checkbox'),
(3, 1, 'Eggs (1 dozen)', 0, 0, 'checkbox'),
(4, 1, 'Meal prep chicken and rice', 0, 1, 'list'),
(5, 1, 'Look up new pasta recipe', 1, 0, 'list'),
(6, 1, 'Apples and bananas', 1, 0, 'checkbox'),

-- Notepad 2: Q3 OKR Planning
(7, 2, 'Define revenue targets', 0, 1, 'list'),
(8, 2, 'Review Q2 performance metrics', 1, 0, 'checkbox'),
(9, 2, 'Schedule sync with marketing', 0, 1, 'checkbox'),
(10, 2, 'Draft engineering hiring plan', 0, 0, 'list'),
(11, 2, 'Finalize OKR document', 0, 1, 'checkbox'),
(12, 2, 'Present to leadership board', 0, 0, 'list'),

-- Notepad 3: Home Renovation Ideas
(13, 3, 'Get quote for kitchen cabinets', 0, 1, 'checkbox'),
(14, 3, 'Compare hardwood vs laminate flooring', 1, 0, 'list'),
(15, 3, 'Call the plumber for the guest bathroom', 0, 1, 'checkbox'),
(16, 3, 'Pick paint colors for living room', 0, 0, 'list'),
(17, 3, 'Measure dimensions for new sofa', 1, 0, 'checkbox'),
(18, 3, 'Buy new light fixtures', 0, 0, 'checkbox'),

-- Notepad 4: Book Recommendations
(19, 4, 'Dune by Frank Herbert', 1, 1, 'list'),
(20, 4, 'Project Hail Mary', 1, 0, 'checkbox'),
(21, 4, 'Atomic Habits', 0, 0, 'checkbox'),
(22, 4, 'The Three-Body Problem', 0, 1, 'list'),
(23, 4, 'Thinking, Fast and Slow', 0, 0, 'list'),
(24, 4, 'Clean Code', 1, 0, 'checkbox'),

-- Notepad 5: Weekend Trip Itinerary
(25, 5, 'Book Airbnb', 1, 1, 'checkbox'),
(26, 5, 'Rent a car', 1, 0, 'checkbox'),
(27, 5, 'Pack hiking boots', 0, 1, 'checkbox'),
(28, 5, 'Look up local coffee shops', 0, 0, 'list'),
(29, 5, 'Dinner reservations at Marios', 0, 1, 'checkbox'),
(30, 5, 'Download offline maps', 0, 0, 'checkbox'),

-- Notepad 6: Daily Standup Notes
(31, 6, 'Blocked by database migration issue', 0, 1, 'list'),
(32, 6, 'Completed frontend auth flow', 1, 0, 'list'),
(33, 6, 'Code review for PR #124', 0, 0, 'checkbox'),
(34, 6, 'Discuss API payload format with backend', 0, 1, 'checkbox'),
(35, 6, 'Fix CSS bug on mobile navbar', 1, 0, 'checkbox'),
(36, 6, 'Prepare for sprint demo', 0, 0, 'list'),

-- Notepad 7: Workout Routine
(37, 7, 'Warm up: 10 min cardio', 0, 0, 'list'),
(38, 7, 'Bench press 3x10', 0, 1, 'checkbox'),
(39, 7, 'Squats 4x8', 1, 1, 'checkbox'),
(40, 7, 'Pull-ups to failure', 0, 0, 'checkbox'),
(41, 7, 'Core circuit (plank, crunches)', 0, 0, 'list'),
(42, 7, 'Cool down and stretch', 0, 0, 'list'),

-- Notepad 8: Tech Stack Research
(43, 8, 'Compare Next.js vs Vite for SPA', 1, 1, 'list'),
(44, 8, 'Look into Tailwind CSS v4', 0, 0, 'list'),
(45, 8, 'Set up SQLAlchemy async session', 1, 1, 'checkbox'),
(46, 8, 'Read docs on generic repositories', 0, 0, 'checkbox'),
(47, 8, 'Draft architecture diagram', 0, 1, 'checkbox'),
(48, 8, 'Evaluate hosting providers (Vercel vs AWS)', 0, 0, 'list'),

-- Notepad 9: Birthday Party Planning
(49, 9, 'Order the cake (chocolate)', 0, 1, 'checkbox'),
(50, 9, 'Send out invitations', 1, 1, 'checkbox'),
(51, 9, 'Buy balloons and decorations', 0, 0, 'checkbox'),
(52, 9, 'Create Spotify playlist', 1, 0, 'list'),
(53, 9, 'Confirm venue booking', 1, 1, 'checkbox'),
(54, 9, 'Prepare party favors', 0, 0, 'list'),

-- Notepad 10: Client Meeting Agendas
(55, 10, 'Review Q1 deliverables', 0, 1, 'list'),
(56, 10, 'Discuss scope creep for phase 2', 0, 1, 'list'),
(57, 10, 'Get approval for mockups', 0, 0, 'checkbox'),
(58, 10, 'Follow up on pending invoices', 1, 1, 'checkbox'),
(59, 10, 'Set timeline for user testing', 0, 0, 'checkbox'),
(60, 10, 'Send meeting minutes', 0, 0, 'checkbox'),

-- Notepad 11: Freelance Projects
(61, 11, 'Redesign landing page for Client A', 0, 1, 'checkbox'),
(62, 11, 'Fix SEO tags on blog platform', 1, 0, 'checkbox'),
(63, 11, 'Draft contract for new lead', 0, 1, 'list'),
(64, 11, 'Update personal portfolio', 0, 0, 'list'),
(65, 11, 'Log billable hours for the week', 1, 0, 'checkbox'),
(66, 11, 'Respond to email inquiries', 0, 0, 'checkbox'),

-- Notepad 12: Garden Maintenance
(67, 12, 'Water the tomatoes', 0, 1, 'checkbox'),
(68, 12, 'Prune the rose bushes', 0, 0, 'checkbox'),
(69, 12, 'Buy organic fertilizer', 1, 0, 'list'),
(70, 12, 'Check for pests on the peppers', 0, 1, 'list'),
(71, 12, 'Mow the front lawn', 1, 0, 'checkbox'),
(72, 12, 'Harvest the basil', 0, 0, 'checkbox');
