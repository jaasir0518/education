# Supabase 500 Error Troubleshooting Guide

## The Issue
You're getting a 500 Internal Server Error when trying to sign up users. This is typically a server-side configuration issue.

## Common Causes & Solutions

### 1. Database Tables Not Set Up
**Problem**: The auth tables haven't been created properly.
**Solution**: 
- Go to your Supabase dashboard
- Navigate to "Authentication" → "Users" 
- This should automatically create the required auth tables

### 2. Row Level Security (RLS) Issues
**Problem**: RLS is enabled but no policies are configured.
**Solution**:
- Go to your Supabase dashboard
- Navigate to "Authentication" → "Policies"
- Make sure you have proper policies set up, or disable RLS temporarily for testing

### 3. Email Configuration
**Problem**: Email provider not configured for confirmation emails.
**Solution**:
- Go to "Authentication" → "Settings"
- Configure your email provider (SMTP settings)
- Or disable email confirmation for testing:
  - Set "Enable email confirmations" to OFF
  - Set "Enable email change confirmations" to OFF

### 4. Database Connection Issues
**Problem**: Database connection or permissions issues.
**Solution**:
- Check your database status in the Supabase dashboard
- Ensure your project is not paused
- Check if you've exceeded any limits

### 5. API Rate Limiting
**Problem**: Too many requests in a short period.
**Solution**:
- Wait a few minutes before trying again
- Check your project's rate limits in the dashboard

## Quick Test Steps

1. **Test Database Connection**:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT 1;`
   - If this fails, there's a database connection issue

2. **Check Auth Status**:
   - Go to Authentication → Users
   - Try manually creating a user from the dashboard
   - If this works, the issue is with your app configuration

3. **Disable Email Confirmation** (for testing):
   - Go to Authentication → Settings
   - Turn off "Enable email confirmations"
   - Try signing up again

## If All Else Fails

1. Create a new Supabase project
2. Copy the new project's URL and anon key to your `.env.local`
3. Make sure to configure authentication settings properly

## Alternative: Use Dummy Authentication (for development)

If you want to continue development while fixing Supabase, you can temporarily use a dummy authentication system.
