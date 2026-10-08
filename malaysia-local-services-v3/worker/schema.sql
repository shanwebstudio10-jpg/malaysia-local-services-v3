DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  salt TEXT NOT NULL, hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT NOT NULL CHECK (type IN ('provider','classified')),
  title TEXT NOT NULL, category TEXT, state TEXT, city TEXT,
  description TEXT, price TEXT, image TEXT,
  phone TEXT NOT NULL, whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER, name TEXT NOT NULL, phone TEXT NOT NULL, message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL, user_id INTEGER NOT NULL, name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(listing_id, user_id)
);
CREATE INDEX idx_listings_filter ON listings(status, type, state, category);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);
INSERT INTO listings (type,title,category,state,city,description,phone,whatsapp,status) VALUES
('provider','Ah Seng Aircond Service','Aircond service','Selangor','Petaling Jaya','Aircond servicing, repair and gas top-up. Same-day visit.','0123456789','0123456789','approved'),
('provider','Kak Ana Home Cleaning','Cleaning','Kuala Lumpur','Cheras','Weekly and one-time house cleaning.','0111234567','0111234567','approved'),
('classified','Lorry for hire - 10ft','Moving/Lorry','Penang','George Town','Lorry with 2 helpers. Price per trip.','0169876543','0169876543','approved');
