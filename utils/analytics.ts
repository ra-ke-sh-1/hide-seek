+interface GameEvent {
+  type: 'game_start' | 'game_end' | 'player_found' | 'world_created' | 'world_shared';
+  gameId?: string;
+  playerId: string;
+  metadata?: any;
+  timestamp: Date;
+}
+
+interface PlayerMetrics {
+  gamesPlayed: number;
+  totalPlayTime: number;
+  winRate: number;
+  averageHideTime: number;
+  averageSeekTime: number;
+  worldsCreated: number;
+  worldsShared: number;
+  friendsAdded: number;
+  achievementsUnlocked: number;
+}
+
+class AnalyticsManager {
+  private events: GameEvent[] = [];
+  private sessionStart: Date = new Date();
+
+  trackEvent(event: Omit<GameEvent, 'timestamp'>) {
+    const fullEvent: GameEvent = {
+      ...event,
+      timestamp: new Date(),
+    };
+    
+    this.events.push(fullEvent);
+    
+    // In production, send to analytics service
+    console.log('Analytics Event:', fullEvent);
+  }
+
+  trackGameStart(gameId: string, playerId: string, gameMode: string) {
+    this.trackEvent({
+      type: 'game_start',
+      gameId,
+      playerId,
+      metadata: { gameMode, sessionDuration: this.getSessionDuration() }
+    });
+  }
+
+  trackGameEnd(gameId: string, playerId: string, result: 'win' | 'loss', score: number) {
+    this.trackEvent({
+      type: 'game_end',
+      gameId,
+      playerId,
+      metadata: { result, score, sessionDuration: this.getSessionDuration() }
+    });
+  }
+
+  trackPlayerFound(gameId: string, seekerId: string, hiderId: string, timeToFind: number) {
+    this.trackEvent({
+      type: 'player_found',
+      gameId,
+      playerId: seekerId,
+      metadata: { hiderId, timeToFind }
+    });
+  }
+
+  trackWorldCreated(playerId: string, worldId: string, blockCount: number, creationTime: number) {
+    this.trackEvent({
+      type: 'world_created',
+      playerId,
+      metadata: { worldId, blockCount, creationTime }
+    });
+  }
+
+  trackWorldShared(playerId: string, worldId: string, shareMethod: string) {
+    this.trackEvent({
+      type: 'world_shared',
+      playerId,
+      metadata: { worldId, shareMethod }
+    });
+  }
+
+  getPlayerMetrics(playerId: string): PlayerMetrics {
+    const playerEvents = this.events.filter(e => e.playerId === playerId);
+    
+    const gamesPlayed = playerEvents.filter(e => e.type === 'game_start').length;
+    const gamesWon = playerEvents.filter(e => 
+      e.type === 'game_end' && e.metadata?.result === 'win'
+    ).length;
+    
+    return {
+      gamesPlayed,
+      totalPlayTime: this.calculateTotalPlayTime(playerEvents),
+      winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
+      averageHideTime: this.calculateAverageHideTime(playerEvents),
+      averageSeekTime: this.calculateAverageSeekTime(playerEvents),
+      worldsCreated: playerEvents.filter(e => e.type === 'world_created').length,
+      worldsShared: playerEvents.filter(e => e.type === 'world_shared').length,
+      friendsAdded: 0, // Would be tracked separately
+      achievementsUnlocked: 0, // Would be tracked separately
+    };
+  }
+
+  private getSessionDuration(): number {
+    return Date.now() - this.sessionStart.getTime();
+  }
+
+  private calculateTotalPlayTime(events: GameEvent[]): number {
+    // Calculate based on game start/end events
+    return events
+      .filter(e => e.type === 'game_end')
+      .reduce((total, event) => total + (event.metadata?.sessionDuration || 0), 0);
+  }
+
+  private calculateAverageHideTime(events: GameEvent[]): number {
+    const foundEvents = events.filter(e => e.type === 'player_found');
+    if (foundEvents.length === 0) return 0;
+    
+    const totalTime = foundEvents.reduce((sum, event) => 
+      sum + (event.metadata?.timeToFind || 0), 0
+    );
+    
+    return totalTime / foundEvents.length;
+  }
+
+  private calculateAverageSeekTime(events: GameEvent[]): number {
+    // Similar calculation for seeking performance
+    return 45; // Placeholder
+  }
+
+  exportData(): string {
+    return JSON.stringify({
+      events: this.events,
+      sessionStart: this.sessionStart,
+      totalEvents: this.events.length,
+    }, null, 2);
+  }
+
+  clearData() {
+    this.events = [];
+    this.sessionStart = new Date();
+  }
+}
+
+export const analytics = new AnalyticsManager();
+
+// Hook for easy analytics usage in components
+export function useAnalytics() {
+  return {
+    trackGameStart: analytics.trackGameStart.bind(analytics),
+    trackGameEnd: analytics.trackGameEnd.bind(analytics),
+    trackPlayerFound: analytics.trackPlayerFound.bind(analytics),
+    trackWorldCreated: analytics.trackWorldCreated.bind(analytics),
+    trackWorldShared: analytics.trackWorldShared.bind(analytics),
+    getPlayerMetrics: analytics.getPlayerMetrics.bind(analytics),
+  };
+}
+