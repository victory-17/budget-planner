#!/bin/bash

# Install Supabase CLI if not already installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Make sure you're logged in
echo "Please make sure you're logged in to Supabase CLI (supabase login)"
echo "Project ID: kimfcqjzyehxxpxmjqdc"

# Link to the Supabase project if not already linked
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref)" != "kimfcqjzyehxxpxmjqdc" ]; then
    echo "Linking to Supabase project..."
    supabase link --project-ref kimfcqjzyehxxpxmjqdc
fi

# Apply migrations
echo "Applying migrations..."
supabase db push

echo "Supabase setup complete!" 