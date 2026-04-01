import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('foundation.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student', -- admin, staff, student, volunteer, sponsor, donor
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    age_track TEXT NOT NULL, -- kids, teenagers, young_adults
    application_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    scholarship_status TEXT DEFAULT 'none',
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    program_track TEXT,
    skills TEXT,
    approval_status TEXT DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT,
    capacity INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    bio TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS trustees (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    title TEXT,
    professional_background TEXT,
    governance_role TEXT,
    years_of_service INTEGER,
    photo_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS grant_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Optional, for registered users
    donor_name TEXT,
    donor_email TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NGN',
    payment_reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, success, failed
    frequency TEXT DEFAULT 'one-time', -- one-time, monthly, quarterly, annually
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS media_library (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    category TEXT,
    type TEXT DEFAULT 'image', -- image, video
    thumbnail TEXT,
    uploaded_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
  );
`);

// Add type and thumbnail columns if they don't exist (for existing databases)
try {
  db.exec("ALTER TABLE media_library ADD COLUMN type TEXT DEFAULT 'image'");
} catch (e) {}
try {
  db.exec("ALTER TABLE media_library ADD COLUMN thumbnail TEXT");
} catch (e) {}

// Add frequency column if it doesn't exist (for existing databases)
try {
  db.exec("ALTER TABLE donations ADD COLUMN frequency TEXT DEFAULT 'one-time'");
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Export database
export default db;
