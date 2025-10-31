+import React, { useState } from 'react';
+import {
+  View,
+  Text,
+  ScrollView,
+  TouchableOpacity,
+  StyleSheet,
+  TextInput,
+  Alert,
+} from 'react-native';
+import {
+  Shield,
+  Flag,
+  Ban,
+  Eye,
+  MessageSquare,
+  Clock,
+  User,
+  AlertTriangle,
+} from 'lucide-react-native';
+
+interface Report {
+  id: string;
+  reporterId: string;
+  reporterName: string;
+  targetId: string;
+  targetName: string;
+  reason: string;
+  description: string;
+  timestamp: Date;
+  status: 'pending' | 'reviewed' | 'resolved';
+  severity: 'low' | 'medium' | 'high';
+}
+
+interface ModerationToolsProps {
+  gameId: string;
+  isHost: boolean;
+}
+
+export default function ModerationTools({ gameId, isHost }: ModerationToolsProps) {
+  const [reports, setReports] = useState<Report[]>([]);
+  const [showReportModal, setShowReportModal] = useState(false);
+  const [reportReason, setReportReason] = useState('');
+  const [reportDescription, setReportDescription] = useState('');
+  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
+
+  const reportReasons = [
+    'Inappropriate language',
+    'Cheating/Exploiting',
+    'Harassment',
+    'Spam',
+    'Inappropriate content',
+    'Other',
+  ];
+
+  const handleReport = (playerId: string, playerName: string) => {
+    setSelectedPlayer(playerId);
+    setShowReportModal(true);
+  };
+
+  const submitReport = () => {
+    if (!reportReason || !selectedPlayer) return;
+
+    const newReport: Report = {
+      id: `report_${Date.now()}`,
+      reporterId: 'current_user',
+      reporterName: 'You',
+      targetId: selectedPlayer,
+      targetName: 'Reported Player',
+      reason: reportReason,
+      description: reportDescription,
+      timestamp: new Date(),
+      status: 'pending',
+      severity: 'medium',
+    };
+
+    setReports(prev => [...prev, newReport]);
+    setShowReportModal(false);
+    setReportReason('');
+    setReportDescription('');
+    setSelectedPlayer(null);
+
+    Alert.alert(
+      'Report Submitted',
+      'Thank you for helping keep our community safe. We\'ll review this report promptly.'
+    );
+  };
+
+  const handleKickPlayer = (playerId: string) => {
+    if (!isHost) return;
+
+    Alert.alert(
+      'Kick Player',
+      'Are you sure you want to remove this player from the game?',
+      [
+        { text: 'Cancel', style: 'cancel' },
+        { 
+          text: 'Kick', 
+          style: 'destructive',
+          onPress: () => {
+            // Implementation would remove player from game
+            Alert.alert('Player Kicked', 'Player has been removed from the game.');
+          }
+        }
+      ]
+    );
+  };
+
+  const handleMutePlayer = (playerId: string) => {
+    Alert.alert(
+      'Mute Player',
+      'You will no longer see messages from this player.',
+      [
+        { text: 'Cancel', style: 'cancel' },
+        { 
+          text: 'Mute', 
+          onPress: () => {
+            // Implementation would mute player locally
+            Alert.alert('Player Muted', 'You will no longer see their messages.');
+          }
+        }
+      ]
+    );
+  };
+
+  return (
+    <View style={styles.container}>
+      <View style={styles.header}>
+        <Shield size={24} color="#4ECDC4" />
+        <Text style={styles.title}>Safety & Moderation</Text>
+      </View>
+
+      <ScrollView style={styles.content}>
+        {/* Quick Actions */}
+        <View style={styles.section}>
+          <Text style={styles.sectionTitle}>Quick Actions</Text>
+          
+          <TouchableOpacity 
+            style={styles.actionCard}
+            onPress={() => setShowReportModal(true)}
+          >
+            <Flag size={20} color="#FF6B6B" />
+            <View style={styles.actionInfo}>
+              <Text style={styles.actionTitle}>Report Player</Text>
+              <Text style={styles.actionDescription}>Report inappropriate behavior</Text>
+            </View>
+          </TouchableOpacity>
+
+          {isHost && (
+            <>
+              <TouchableOpacity style={styles.actionCard}>
+                <Ban size={20} color="#F59E0B" />
+                <View style={styles.actionInfo}>
+                  <Text style={styles.actionTitle}>Kick Player</Text>
+                  <Text style={styles.actionDescription}>Remove disruptive players</Text>
+                </View>
+              </TouchableOpacity>
+
+              <TouchableOpacity style={styles.actionCard}>
+                <Eye size={20} color="#8B5CF6" />
+                <View style={styles.actionInfo}>
+                  <Text style={styles.actionTitle}>Spectator Mode</Text>
+                  <Text style={styles.actionDescription}>Monitor game activity</Text>
+                </View>
+              </TouchableOpacity>
+            </>
+          )}
+        </View>
+
+        {/* Safety Guidelines */}
+        <View style={styles.section}>
+          <Text style={styles.sectionTitle}>Community Guidelines</Text>
+          <View style={styles.guidelinesCard}>
+            <Text style={styles.guidelineText}>✅ Be respectful to all players</Text>
+            <Text style={styles.guidelineText}>✅ Play fairly without cheating</Text>
+            <Text style={styles.guidelineText}>✅ Keep chat family-friendly</Text>
+            <Text style={styles.guidelineText}>❌ No harassment or bullying</Text>
+            <Text style={styles.guidelineText}>❌ No inappropriate content</Text>
+            <Text style={styles.guidelineText}>❌ No sharing personal information</Text>
+          </View>
+        </View>
+
+        {/* Recent Reports (Host only) */}
+        {isHost && reports.length > 0 && (
+          <View style={styles.section}>
+            <Text style={styles.sectionTitle}>Recent Reports</Text>
+            {reports.slice(0, 3).map((report) => (
+              <View key={report.id} style={styles.reportCard}>
+                <View style={styles.reportHeader}>
+                  <Text style={styles.reportReason}>{report.reason}</Text>
+                  <Text style={[
+                    styles.reportStatus,
+                    { color: report.status === 'pending' ? '#F59E0B' : '#10B981' }
+                  ]}>
+                    {report.status}
+                  </Text>
+                </View>
+                <Text style={styles.reportDescription}>{report.description}</Text>
+                <Text style={styles.reportTime}>
+                  {report.timestamp.toLocaleTimeString()}
+                </Text>
+              </View>
+            ))}
+          </View>
+        )}
+      </ScrollView>
+
+      {/* Report Modal */}
+      {showReportModal && (
+        <View style={styles.modalOverlay}>
+          <View style={styles.modalContent}>
+            <Text style={styles.modalTitle}>Report Player</Text>
+            
+            <Text style={styles.inputLabel}>Reason for report</Text>
+            <ScrollView style={styles.reasonsList}>
+              {reportReasons.map((reason) => (
+                <TouchableOpacity
+                  key={reason}
+                  style={[
+                    styles.reasonOption,
+                    reportReason === reason && styles.selectedReason
+                  ]}
+                  onPress={() => setReportReason(reason)}
+                >
+                  <Text style={[
+                    styles.reasonText,
+                    reportReason === reason && styles.selectedReasonText
+                  ]}>
+                    {reason}
+                  </Text>
+                </TouchableOpacity>
+              ))}
+            </ScrollView>
+
+            <Text style={styles.inputLabel}>Additional details (optional)</Text>
+            <TextInput
+              style={styles.descriptionInput}
+              value={reportDescription}
+              onChangeText={setReportDescription}
+              placeholder="Provide more context..."
+              placeholderTextColor="#718096"
+              multiline
+              numberOfLines={3}
+            />
+
+            <View style={styles.modalActions}>
+              <TouchableOpacity 
+                style={styles.cancelButton}
+                onPress={() => setShowReportModal(false)}
+              >
+                <Text style={styles.cancelButtonText}>Cancel</Text>
+              </TouchableOpacity>
+              <TouchableOpacity 
+                style={[styles.submitButton, !reportReason && styles.disabledButton]}
+                onPress={submitReport}
+                disabled={!reportReason}
+              >
+                <Text style={styles.submitButtonText}>Submit Report</Text>
+              </TouchableOpacity>
+            </View>
+          </View>
+        </View>
+      )}
+    </View>
+  );
+}
+
+const styles = StyleSheet.create({
+  container: {
+    flex: 1,
+    backgroundColor: '#1A202C',
+  },
+  header: {
+    flexDirection: 'row',
+    alignItems: 'center',
+    padding: 24,
+    paddingTop: 60,
+    borderBottomWidth: 1,
+    borderBottomColor: '#2D3748',
+  },
+  title: {
+    fontSize: 20,
+    fontWeight: 'bold',
+    color: '#FFFFFF',
+    marginLeft: 12,
+  },
+  content: {
+    flex: 1,
+  },
+  section: {
+    padding: 24,
+  },
+  sectionTitle: {
+    fontSize: 18,
+    fontWeight: 'bold',
+    color: '#FFFFFF',
+    marginBottom: 16,
+  },
+  actionCard: {
+    flexDirection: 'row',
+    alignItems: 'center',
+    backgroundColor: '#2D3748',
+    borderRadius: 12,
+    padding: 16,
+    marginBottom: 8,
+  },
+  actionInfo: {
+    marginLeft: 16,
+    flex: 1,
+  },
+  actionTitle: {
+    fontSize: 16,
+    fontWeight: 'bold',
+    color: '#FFFFFF',
+    marginBottom: 2,
+  },
+  actionDescription: {
+    fontSize: 14,
+    color: '#A0AEC0',
+  },
+  guidelinesCard: {
+    backgroundColor: '#2D3748',
+    borderRadius: 12,
+    padding: 16,
+  },
+  guidelineText: {
+    fontSize: 14,
+    color: '#A0AEC0',
+    marginBottom: 8,
+    lineHeight: 20,
+  },
+  reportCard: {
+    backgroundColor: '#2D3748',
+    borderRadius: 12,
+    padding: 16,
+    marginBottom: 8,
+  },
+  reportHeader: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+    marginBottom: 8,
+  },
+  reportReason: {
+    fontSize: 14,
+    fontWeight: 'bold',
+    color: '#FFFFFF',
+  },
+  reportStatus: {
+    fontSize: 12,
+    fontWeight: '600',
+    textTransform: 'uppercase',
+  },
+  reportDescription: {
+    fontSize: 14,
+    color: '#A0AEC0',
+    marginBottom: 8,
+  },
+  reportTime: {
+    fontSize: 12,
+    color: '#718096',
+  },
+  modalOverlay: {
+    position: 'absolute',
+    top: 0,
+    left: 0,
+    right: 0,
+    bottom: 0,
+    backgroundColor: '#00000080',
+    justifyContent: 'center',
+    alignItems: 'center',
+  },
+  modalContent: {
+    backgroundColor: '#2D3748',
+    borderRadius: 16,
+    padding: 24,
+    margin: 24,
+    width: '90%',
+    maxHeight: '80%',
+  },
+  modalTitle: {
+    fontSize: 20,
+    fontWeight: 'bold',
+    color: '#FFFFFF',
+    marginBottom: 20,
+    textAlign: 'center',
+  },
+  inputLabel: {
+    fontSize: 14,
+    fontWeight: '600',
+    color: '#FFFFFF',
+    marginBottom: 8,
+  },
+  reasonsList: {
+    maxHeight: 200,
+    marginBottom: 16,
+  },
+  reasonOption: {
+    backgroundColor: '#4A5568',
+    borderRadius: 8,
+    padding: 12,
+    marginBottom: 8,
+  },
+  selectedReason: {
+    backgroundColor: '#FF6B6B',
+  },
+  reasonText: {
+    color: '#A0AEC0',
+    fontSize: 14,
+  },
+  selectedReasonText: {
+    color: '#FFFFFF',
+    fontWeight: 'bold',
+  },
+  descriptionInput: {
+    backgroundColor: '#4A5568',
+    borderRadius: 12,
+    padding: 16,
+    fontSize: 14,
+    color: '#FFFFFF',
+    height: 80,
+    textAlignVertical: 'top',
+    marginBottom: 20,
+  },
+  modalActions: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+  },
+  cancelButton: {
+    flex: 0.45,
+    backgroundColor: '#4A5568',
+    borderRadius: 12,
+    padding: 16,
+    alignItems: 'center',
+  },
+  cancelButtonText: {
+    color: '#FFFFFF',
+    fontWeight: 'bold',
+  },
+  submitButton: {
+    flex: 0.45,
+    backgroundColor: '#FF6B6B',
+    borderRadius: 12,
+    padding: 16,
+    alignItems: 'center',
+  },
+  disabledButton: {
+    backgroundColor: '#4A5568',
+    opacity: 0.6,
+  },
+  submitButtonText: {
+    color: '#FFFFFF',
+    fontWeight: 'bold',
+  },
+});
+