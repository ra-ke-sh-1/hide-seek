import { useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useRealtime(channel: string, callback: (payload: any) => void) {
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!channel) return;

    console.log(`[Realtime] Subscribing to channel: ${channel}`);

    // Extract gameId from channel name (format: game_${gameId})
    const gameId = channel.startsWith('game_') ? channel.substring(5) : null;
    console.log(`[Realtime] Extracted gameId: ${gameId}`);

    const handleBroadcast = (payload: any) => {
      console.log(`[Realtime] Broadcast event on ${channel}:`, payload);
      // Forward the actual payload content, not wrapped
      callbackRef.current(payload.payload);
    };

    const handleGamePlayersChange = (payload: any) => {
      console.log(`[Realtime] game_players change on ${channel}:`, {
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
        table: 'game_players'
      });
      callbackRef.current({
        ...payload,
        table: 'game_players',
        event: payload.eventType
      });
    };

    const handleGamesChange = (payload: any) => {
      console.log(`[Realtime] games change on ${channel}:`, {
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
        table: 'games'
      });
      callbackRef.current({
        ...payload,
        table: 'games',
        event: payload.eventType
      });
    };

    // Build subscription - TEMPORARILY REMOVE FILTERS FOR DEBUGGING
    console.log(`[Realtime] 🔍 DEBUGGING: Subscribing WITHOUT filters to test postgres_changes`);
    let subscription = supabase
      .channel(channel, {
        config: {
          broadcast: { self: true }
        }
      })
      .on('broadcast', { event: 'game_event' }, handleBroadcast)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players'
      }, handleGamePlayersChange)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games'
      }, handleGamesChange);

    const channel_subscription = subscription.subscribe((status) => {
      console.log(`[Realtime] Subscription status for ${channel}:`, status);
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] ✅ Successfully subscribed to ${channel}`);
        console.log(`[Realtime] 🔍 DEBUGGING: NO FILTERS APPLIED - listening to ALL changes on game_players and games tables`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] ❌ Error subscribing to ${channel}`);
      }
      setIsConnected(status === 'SUBSCRIBED');
    });

    setSubscription(channel_subscription);

    return () => {
      console.log(`[Realtime] Unsubscribing from channel: ${channel}`);
      channel_subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [channel]);

  const sendMessage = (message: any) => {
    if (subscription) {
      subscription.send({
        type: 'broadcast',
        event: 'game_event',
        payload: message,
      });
    }
  };

  return { sendMessage, isConnected };
}