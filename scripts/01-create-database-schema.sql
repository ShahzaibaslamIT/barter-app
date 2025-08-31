-- Creating comprehensive database schema for barter trading platform
-- Enable PostGIS extension for geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('service_provider', 'item_owner', 'both')) DEFAULT 'both',
    location GEOGRAPHY(POINT, 4326),
    location_text VARCHAR(255),
    contact_method VARCHAR(50) DEFAULT 'email',
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table (for both items and services)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('item', 'service')) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    location_text VARCHAR(255),
    barter_request TEXT,
    photos TEXT[] DEFAULT '{}',
    condition VARCHAR(20) CHECK (condition IN ('new', 'good', 'fair', 'used')),
    availability JSONB,
    skill_level VARCHAR(20) CHECK (skill_level IN ('unskilled', 'skilled')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barter offers table
CREATE TABLE barter_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    offerer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message threads table
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barter_id UUID NOT NULL REFERENCES barter_offers(id) ON DELETE CASCADE,
    user_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barter_id UUID NOT NULL REFERENCES barter_offers(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT CHECK (LENGTH(comment) <= 250),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(barter_id, rater_id)
);

-- Create indexes for better performance
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_barter_offers_listing_id ON barter_offers(listing_id);
CREATE INDEX idx_barter_offers_offerer_id ON barter_offers(offerer_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barter_offers_updated_at BEFORE UPDATE ON barter_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
