# QueueBeats Real-Time Connection Guide

This document explains how the real-time connection features work in QueueBeats and how we fixed the "Connecting..." issue.

## Overview

QueueBeats uses Supabase's real-time feature to provide live updates for:
- Queue status changes
- New songs added to a queue
- Vote counts

## The "Connecting..." Issue

The application was showing a perpetual "Connecting..." status message instead of establishing a proper connection with Supabase's real-time service.

### Root Causes

1. **Empty Song List Handling**: 
   - When a queue had no songs, the subscription filter for votes would fail since it relied on having song IDs
   - This created an invalid PostgreSQL filter expression

2. **Connection Status Not Being Updated**:
   - The real-time connection might establish successfully, but the UI status wasn't being updated
   - The connection status relied on data changes, not just on connection success

3. **WebSocket Reconnection Issues**:
   - Supabase real-time client wasn't handling reconnects properly
   - The heartbeat intervals were too long for quick recovery

## Solutions Implemented

### 1. Fixed Real-Time Subscriptions

In `realtime.ts`:
- Added a dummy filter for queues with no songs
- Improved error handling and logging
- Added more detailed subscription status tracking

```typescript
// Create a channel that won't match any votes but will at least establish a connection
const emptyChannel = supabase
  .channel(channelKey)
  .on(
    'postgres_changes',
    {
      event: '*', 
      schema: 'public',
      table: 'votes',
      filter: `song_id=eq.00000000-0000-0000-0000-000000000000` // This won't match any real votes
    },
    (payload) => {
      // This won't be called since the filter won't match anything
    }
  )
  .subscribe((status) => {
    console.log(`Votes subscription status (dummy): ${status}`);
    
    // Even with a dummy filter, we can still trigger the callback on success
    if (status === 'SUBSCRIBED') {
      callback({
        new: null,
        old: null,
        eventType: 'INSERT' // Dummy event type
      });
    }
  });
```

### 2. Improved UI State Management

In `GuestQueueView.tsx`:
- Updated the UI to show real-time status correctly
- Added animation to the "Connecting..." indicator
- Made sure `isRealTimeActive` state is reset properly

### 3. Enhanced WebSocket Configuration

In `supabase.ts`:
- Adjusted WebSocket connection parameters
- Added improved logging for connection status
- Updated the heartbeat interval from 30s to 5s

```typescript
realtime: {
  timeout: 30000, // 30 seconds timeout for realtime connections
  params: {
    eventsPerSecond: 10, // Default is 1, increase for better responsiveness
    heartbeatIntervalMs: 5000 // Default is 30000 (30s), reduce for faster reconnects
  }
}
```

### 4. Added WebSocket Monitoring

Added code to monitor WebSocket connections:
- Logs connection attempts
- Tracks connection lifecycle
- Helps with debugging future issues

## Testing

A test file `test-realtime.html` has been created that can be used to:
1. Verify Supabase real-time connection independent of the app
2. Test that subscriptions work with dummy filters
3. Log WebSocket connection status

## Troubleshooting

If you encounter real-time connection issues:

1. Check browser console for WebSocket errors
2. Verify Supabase project settings for real-time enabled
3. Check network connectivity to Supabase
4. Try the test-realtime.html tool to isolate the issue

## References

- [Supabase Real-Time Documentation](https://supabase.com/docs/guides/realtime)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
