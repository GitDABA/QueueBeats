# QueueBeats Database Health Check System

This document describes the automated database health check and setup system for the QueueBeats application.

## Overview

The database health check system provides automatic validation and creation of required database tables and structures. It ensures that all necessary database components exist before the application attempts to use them, preventing runtime errors due to missing tables.

## Key Features

- **Automatic Table Creation**: Checks for and creates required tables if they don't exist
- **Row Level Security (RLS)**: Automatically configures proper security policies for all tables
- **Logging**: Maintains a setup log to track database changes
- **Health Monitoring**: Provides a function to check database health status
- **Self-healing**: Can recover from common database issues automatically

## Required Tables

The system ensures the following tables exist and have the correct structure:

1. **health_check**: Stores application health status information
2. **spotify_tokens**: Stores Spotify API authentication tokens for users
3. **queues**: Stores music queues created by users
4. **queue_tracks**: Stores tracks added to queues
5. **user_settings**: Stores user preferences and settings
6. **setup_log**: Records database setup and maintenance events

## How to Use

### Running a Health Check

To run a manual health check and get a JSON report of database status:

```sql
SELECT check_database_health();
```

This will:
- Check if all required tables exist
- Report any missing tables
- Update the health_check table with the latest status

### Integration with Application Startup

Include the health check in your application startup sequence:

1. **Frontend Integration** (TypeScript):
   ```typescript
   import { runDatabaseHealthCheck } from './utils/setupDatabase';

   // Run at application startup
   async function initApp() {
     const healthStatus = await runDatabaseHealthCheck();
     if (healthStatus.status !== 'healthy') {
       console.warn('Database health issues detected:', healthStatus);
       // Take appropriate action
     }
   }
   ```

2. **Backend Integration** (Python):
   ```python
   from database import run_health_check

   def startup_event():
       health_status = run_health_check()
       if health_status["status"] != "healthy":
           print(f"Database health issues detected: {health_status}")
           # Take appropriate action
   ```

## Troubleshooting

If you encounter database issues:

1. Run the full health check script:
   ```sql
   \i health_check_setup.sql
   ```

2. Check the setup log table for detailed information:
   ```sql
   SELECT * FROM setup_log ORDER BY created_at DESC LIMIT 10;
   ```

3. Manually verify table existence and structure:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## Extending the System

To add new required tables:

1. Add a DO block for the new table in `health_check_setup.sql`
2. Add the table name to the `required_tables` CTE in the `check_database_health()` function
3. Update this documentation to reflect the new table

## Security Considerations

- The system uses Supabase's Row Level Security (RLS) to ensure proper data access controls
- Table creation operations require database owner privileges
- The service_role is granted specific access where needed
