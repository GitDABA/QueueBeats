# QueueBeats Database Health and Auto-Setup System

## Overview

The QueueBeats application includes a comprehensive database health check and automatic setup system. This system ensures that all required database tables exist and have the proper structure before the application attempts to use them, preventing runtime errors due to missing database components.

## Components

The database health system consists of several integrated components:

### 1. SQL Setup Script (`health_check_setup.sql`)

This is the core script that:
- Checks for and creates required tables if they don't exist
- Sets up Row Level Security (RLS) policies for tables
- Configures proper relationships between tables
- Provides functions for health checking
- Records setup events in a log table

### 2. Frontend Utilities (`databaseHealth.ts`)

TypeScript utilities that:
- Provide functions to check database health status
- Handle setup of missing tables
- Offer graceful error recovery
- Support both development and production environments

### 3. Netlify Serverless Function (`database-health-check.js`)

A serverless function that:
- Performs health checks with service role privileges
- Creates missing tables when authorized
- Returns detailed health information
- Supports both direct and manual table checks

### 4. Application Integration

The database health system is integrated with the application through:
- Startup checks in `main.tsx`
- UI components in `AppWrapper.tsx` for user interaction
- Integration with authentication flow

## Database Tables

The following tables are considered essential for the application:

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `health_check` | Store application health status | id, status, last_checked |
| `spotify_tokens` | Store Spotify API tokens for users | user_id, access_token, refresh_token, expires_at |
| `queues` | Store music queues created by users | id, owner_id, name, is_active, is_public |
| `queue_tracks` | Store tracks added to queues | queue_id, track_uri, position, is_played |
| `user_settings` | Store user preferences | user_id, theme, notification_preferences |
| `setup_log` | Record database setup events | event_name, event_details, created_at |

## Flow Diagrams

### Application Startup Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Application    │────▶│  Database       │────▶│  Render         │
│  Initialization │     │  Health Check   │     │  Application    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                               │
                               │ (if issues detected)
                               ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │  Display Setup  │────▶│  Auto-create    │
                        │  UI to User     │     │  Missing Tables │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

### Table Creation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Check If Table │────▶│  Create Table   │────▶│  Apply Row      │
│  Exists         │     │  If Missing     │     │  Level Security │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │                 │
                                                │  Log Setup      │
                                                │  Event          │
                                                │                 │
                                                └─────────────────┘
```

## Usage

### For Developers

1. **Running a Health Check**

   ```typescript
   import { checkDatabaseHealth } from './utils/databaseHealth';

   async function verifyDatabase() {
     const healthResult = await checkDatabaseHealth();
     console.log('Database health:', healthResult);
     
     if (healthResult.status !== 'healthy') {
       console.warn('Database issues detected:', healthResult.missing_tables);
     }
   }
   ```

2. **Setting Up Missing Tables**

   ```typescript
   import { setupMissingTables } from './utils/databaseHealth';

   async function repairDatabase(missingTables) {
     const result = await setupMissingTables(missingTables);
     
     if (result.success) {
       console.log('Database setup successful!');
     } else {
       console.error('Database setup failed:', result.error);
     }
   }
   ```

3. **Manually Running Setup SQL**

   ```bash
   # Using psql client
   psql -U your_db_user -d your_db_name -f health_check_setup.sql
   
   # Using Supabase CLI
   supabase db execute < health_check_setup.sql
   ```

### For DevOps

1. **Deployment Checks**

   Add this to your deployment pipeline to ensure database health:

   ```yaml
   # Example GitHub Action step
   - name: Check Database Health
     run: |
       curl -X GET https://your-netlify-site/.netlify/functions/database-health-check
   ```

2. **Monitoring Health**

   Set up regular checks using:

   ```bash
   # cron job example
   0 * * * * curl -X GET https://your-netlify-site/.netlify/functions/database-health-check >> /var/log/queuebeats-health.log
   ```

## Troubleshooting

### Common Issues

1. **Missing Tables After Deployment**
   - Run the health check function manually
   - Check if the service role has proper permissions
   - Verify environment variables are set correctly

2. **RLS Policy Errors**
   - Ensure auth.uid() function is available
   - Check if RLS is enabled on the table
   - Verify service_role exists in the database

3. **Function Creation Errors**
   - Check for syntax errors in SQL functions
   - Verify proper function privileges
   - Ensure required extensions are enabled

## Extending the System

To add new tables to the health check system:

1. Add the table creation block to `health_check_setup.sql`
2. Add the table name to the `required_tables` list in the check function
3. Update documentation to reflect the new table
4. Add any necessary RLS policies

## Security Considerations

The database health system follows these security practices:

- Uses Row Level Security (RLS) for all tables
- Service role access is carefully controlled
- No sensitive information in logs
- Proper error handling to prevent information leakage
- Authenticated API endpoints
