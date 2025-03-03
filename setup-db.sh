#!/bin/bash
# QueueBeats Supabase Database Setup Script

echo "QueueBeats Supabase Database Setup"
echo "=================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. You can install it with:"
    echo "npm install -g supabase"
    echo ""
    echo "Alternatively, you can set up the database manually using the Supabase web interface."
    echo "See SUPABASE_SETUP.md for instructions."
    
    echo ""
    echo "Would you like to continue with manual setup? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Please follow the instructions in SUPABASE_SETUP.md to set up your database manually."
        exit 0
    else
        exit 1
    fi
fi

# Check if user is logged in to Supabase
echo "Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "You need to log in to Supabase first. Run:"
    echo "supabase login"
    exit 1
fi

# Ask for project ID
echo ""
echo "Please enter your Supabase project ID (found in your project settings):"
read -r project_id

# Confirm before proceeding
echo ""
echo "This script will create the following tables in your Supabase project:"
echo "- profiles"
echo "- queues"
echo "- songs"
echo "- votes"
echo ""
echo "It will also set up Row Level Security policies and triggers."
echo ""
echo "Do you want to continue? (y/n)"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Execute the SQL script
echo ""
echo "Executing SQL script..."
supabase db execute -f ./supabase-schema.sql --project-ref "$project_id"

# Check if execution was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure your .env file has the correct Supabase credentials"
    echo "2. Start your application and test the database connection"
    echo ""
    echo "For more information, see SUPABASE_SETUP.md"
else
    echo ""
    echo "❌ Database setup failed. Please check the error messages above."
    echo "You can try setting up the database manually using the Supabase web interface."
    echo "See SUPABASE_SETUP.md for instructions."
fi
