-- Lingua App Database Schema

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    native_language VARCHAR(10) DEFAULT 'en',
    target_language VARCHAR(10),
    daily_goal INTEGER DEFAULT 10,
    current_streak INTEGER DEFAULT 0,
    last_lesson_date DATE,
    total_words_learned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Languages
CREATE TABLE IF NOT EXISTS languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10)
);

-- Words
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code VARCHAR(10) NOT NULL,
    word VARCHAR(255) NOT NULL,
    english_translation VARCHAR(255) NOT NULL,
    phonetic VARCHAR(255),
    example_sentence TEXT,
    difficulty INTEGER DEFAULT 2,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(language_code, word)
);

-- User Word Progress
CREATE TABLE IF NOT EXISTS user_word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
    correct_count INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    next_review_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_date DATE NOT NULL,
    total_words INTEGER DEFAULT 0,
    words_completed INTEGER DEFAULT 0,
    game_score INTEGER,
    game_total INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_date)
);

-- Lesson Words
CREATE TABLE IF NOT EXISTS lesson_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    word_type VARCHAR(20) DEFAULT 'new' CHECK (word_type IN ('new', 'review')),
    user_rating VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, word_id)
);

-- Seed Languages
INSERT INTO languages (code, name, flag_emoji) VALUES
    ('es', 'Spanish', '🇪🇸'),
    ('fr', 'French', '🇫🇷'),
    ('de', 'German', '🇩🇪'),
    ('it', 'Italian', '🇮🇹'),
    ('pt', 'Portuguese', '🇵🇹')
ON CONFLICT (code) DO NOTHING;

-- Seed Spanish Words
INSERT INTO words (language_code, word, english_translation, phonetic, example_sentence, difficulty, category) VALUES
    ('es', 'Hola', 'Hello', 'OH-lah', '¡Hola, buenos días!', 1, 'greetings'),
    ('es', 'Adiós', 'Goodbye', 'ah-dee-OHS', 'Adiós, hasta mañana.', 1, 'greetings'),
    ('es', 'Gracias', 'Thank you', 'GRAH-see-ahs', 'Muchas gracias.', 1, 'greetings'),
    ('es', 'Por favor', 'Please', 'pohr fah-BOHR', 'Agua, por favor.', 1, 'greetings'),
    ('es', 'Buenos días', 'Good morning', 'BWEH-nohs DEE-ahs', 'Buenos días.', 1, 'greetings'),
    ('es', '¿Cómo estás?', 'How are you?', 'KOH-moh ehs-TAHS', '¿Cómo estás hoy?', 1, 'phrases'),
    ('es', 'Muy bien', 'Very well', 'mwee bee-EHN', 'Estoy muy bien.', 1, 'phrases'),
    ('es', 'No entiendo', 'I do not understand', 'noh ehn-tee-EHN-doh', 'No entiendo.', 1, 'phrases'),
    ('es', 'Uno', 'One', 'OO-noh', 'Tengo uno.', 1, 'numbers'),
    ('es', 'Dos', 'Two', 'dohs', 'Necesito dos.', 1, 'numbers'),
    ('es', 'Tres', 'Three', 'trehs', 'Tengo tres.', 1, 'numbers'),
    ('es', 'Agua', 'Water', 'AH-gwah', 'Un vaso de agua.', 1, 'food'),
    ('es', 'Café', 'Coffee', 'kah-FEH', 'Un café, por favor.', 1, 'food'),
    ('es', 'Pan', 'Bread', 'pahn', 'Me gusta el pan.', 1, 'food'),
    ('es', 'Ser', 'To be', 'sehr', 'Yo soy estudiante.', 1, 'verbs'),
    ('es', 'Tener', 'To have', 'teh-NEHR', 'Tengo mucho trabajo.', 1, 'verbs'),
    ('es', 'Casa', 'House', 'KAH-sah', 'Mi casa es grande.', 1, 'nouns'),
    ('es', 'Amigo', 'Friend', 'ah-MEE-goh', 'Él es mi amigo.', 1, 'nouns'),
    ('es', 'Dinero', 'Money', 'dee-NEH-roh', 'Necesito más dinero.', 1, 'nouns'),
    ('es', 'Grande', 'Big', 'GRAHN-deh', 'Esta casa es grande.', 1, 'adjectives')
ON CONFLICT (language_code, word) DO NOTHING;

-- Row Level Security (disabled for MVP - enable later with proper auth)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_words ENABLE ROW LEVEL SECURITY;

-- Disable RLS for MVP (allow all operations)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_words DISABLE ROW LEVEL SECURITY;

-- Words policies (public read - keep this)
CREATE POLICY "Anyone can view words" ON words FOR SELECT USING (true);
