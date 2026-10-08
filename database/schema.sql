CREATE TABLE IF NOT EXISTS service_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 customer_name TEXT NOT NULL,
 phone TEXT NOT NULL,
 service TEXT NOT NULL,
 description TEXT NOT NULL,
 location TEXT NOT NULL,
 postcode TEXT,
 preferred_date TEXT,
 preferred_time TEXT,
 photo_url TEXT,
 status TEXT NOT NULL DEFAULT 'New',
 assigned_worker_id INTEGER,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 phone TEXT,
 service TEXT,
 area TEXT,
 status TEXT DEFAULT 'Active',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL UNIQUE,
 description TEXT,
 active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS admins (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 role TEXT DEFAULT 'admin',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO services(name,description) VALUES
('Electrician','Electrical repairs and installation'),
('Plumbing','Leaks, pipes, taps and toilet repairs'),
('Painting','House, office and shop painting'),
('Aircond Service','Cleaning, repair and installation'),
('Renovation','Renovation and repair works'),
('Handyman','General maintenance'),
('Waterproofing','Roof, bathroom and wall waterproofing'),
('Other Works','Other local service requirements');
