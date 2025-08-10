-- Video Progress Table
-- This table tracks user progress for course videos

-- Drop table if it exists (for development only - remove in production)
DROP TABLE IF EXISTS video_progress;

-- Create video_progress table
CREATE TABLE video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    current_time DECIMAL(10, 2) DEFAULT 0,
    duration DECIMAL(10, 2) DEFAULT 0,
    watch_percentage DECIMAL(5, 2) DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one progress record per user per course
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_video_progress_course_id ON video_progress(course_id);
CREATE INDEX idx_video_progress_user_course ON video_progress(user_id, course_id);

-- Enable Row Level Security
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own video progress" ON video_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress" ON video_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" ON video_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video progress" ON video_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_video_progress_updated_at
    BEFORE UPDATE ON video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_video_progress_updated_at();
