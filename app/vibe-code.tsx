import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ArrowLeft, Sparkles, Wand as Wand2, RefreshCw, Download, CreditCard as Edit3, Zap, Brain } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWorldStore } from '@/stores/worldStore';

export default function VibeCodeScreen() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorld, setGeneratedWorld] = useState<any>(null);
  const { generateFromPrompt, saveWorld } = useWorldStore();
  
  const [suggestions] = useState([
    'A spooky haunted mansion with secret passages',
    'A futuristic space station with teleporter rooms',
    'A cozy coffee shop with multiple hiding spots',
    'An underwater research facility with glass tunnels',
    'A medieval castle with towers and secret dungeons',
    'A bustling marketplace with vendor stalls and alleys',
    'A magical library with floating books and hidden passages',
    'A pirate ship with treasure rooms and crow\'s nest'
  ]);

  const generateWorld = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const world = await generateFromPrompt(prompt);
      setGeneratedWorld(world);
    } catch (error) {
      Alert.alert('Generation Failed', 'Failed to generate world. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateWorld = () => {
    generateWorld();
  };

  const editWorld = () => {
    if (generatedWorld) {
      saveWorld(generatedWorld);
    }
    router.push('/world-builder');
  };

  const handleSaveWorld = () => {
    if (generatedWorld) {
      saveWorld(generatedWorld);
      Alert.alert('Success', 'World saved to your collection!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
        <View style={styles.vibeIcon}>
          <Brain size={32} color="#FFE66D" />
          <Sparkles size={20} color="#4ECDC4" style={styles.sparkleOverlay} />
        </View>
        </TouchableOpacity>
          Describe your dream hide-and-seek world, and our AI will bring it to life in seconds! 
          Be creative - mention themes, hiding spots, atmosphere, and special features.
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Sparkles size={32} color="#FFE66D" />
          <Text style={styles.description}>
            Describe your dream hide-and-seek world, and AI will bring it to life in seconds!
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Describe your world</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="e.g., A magical forest with treehouse hideouts, glowing mushrooms, and secret underground tunnels connecting different areas..."
            placeholderTextColor="#718096"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={[styles.generateButton, !prompt.trim() && styles.disabledButton]}
            onPress={generateWorld}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.generateButtonText}>Generating Magic...</Text>
              </>
            ) : (
              <>
                <Wand2 size={20} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate World</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>Need inspiration? Try these:</Text>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionCard}
              onPress={() => setPrompt(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generated World Preview */}
        {generatedWorld && (
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Zap size={20} color="#4ECDC4" />
              <Text style={styles.previewTitle}>Your Generated World</Text>
            </View>
            <View style={styles.worldPreview}>
              <Text style={styles.worldPreviewName}>{generatedWorld.name}</Text>
              <Text style={styles.worldPreviewDescription}>{generatedWorld.description}</Text>
              
              <View style={styles.worldStats}>
                <Text style={styles.worldStat}>🧱 {generatedWorld.blocks.length} blocks</Text>
                <Text style={styles.worldStat}>📍 {generatedWorld.spawnPoints.length} spawns</Text>
                <Text style={styles.worldStat}>🎯 {generatedWorld.tags.join(', ')}</Text>
              </View>

              {/* Block visualization */}
              <View style={styles.miniCanvas}>
                {generatedWorld.blocks.slice(0, 20).map((block: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.miniBlock,
                      {
                        left: block.position.x / 3,
                        top: block.position.y / 3,
                        backgroundColor: getBlockColor(block.type),
                      }
                    ]}
                  />
                ))}
              </View>

              <View style={styles.previewActions}>
                <TouchableOpacity 
                  style={styles.previewAction}
                  onPress={regenerateWorld}
                >
                  <RefreshCw size={16} color="#A0AEC0" />
                  <Text style={styles.previewActionText}>Regenerate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.previewAction}
                  onPress={editWorld}
                >
                  <Edit3 size={16} color="#4ECDC4" />
                  <Text style={[styles.previewActionText, { color: '#4ECDC4' }]}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.previewAction, styles.saveAction]}
                  onPress={handleSaveWorld}
                >
                  <Download size={16} color="#FFFFFF" />
                  <Text style={[styles.previewActionText, { color: '#FFFFFF' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Pro Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>💡 Be specific about themes and atmosphere</Text>
            <Text style={styles.tipText}>🕳️ Mention hiding spots you want (lockers, vents, secret rooms)</Text>
            <Text style={styles.tipText}>🏗️ Describe the setting (school, park, spaceship, castle)</Text>
            <Text style={styles.tipText}>🎨 Add details about colors, lighting, and mood</Text>
            <Text style={styles.tipText}>⚡ Include interactive elements (doors, elevators, switches)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getBlockColor(type: string): string {
  const colors: { [key: string]: string } = {
    wall: '#8B5CF6',
    door: '#F59E0B',
    tree: '#10B981',
    car: '#EF4444',
    building: '#6B7280',
    locker: '#EC4899',
    barrel: '#F97316',
  };
  return colors[type] || '#4A5568';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  descriptionSection: {
    alignItems: 'center',
    padding: 24,
  },
  vibeIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  description: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  inputSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  promptInput: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    height: 120,
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#4A5568',
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  suggestionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  suggestionCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
  },
  previewSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  worldPreview: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
  },
  worldPreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  worldPreviewDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 16,
    lineHeight: 20,
  },
  worldStats: {
    marginBottom: 16,
  },
  worldStat: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  miniCanvas: {
    width: '100%',
    height: 120,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    position: 'relative',
    marginBottom: 16,
  },
  miniBlock: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4A5568',
  },
  saveAction: {
    backgroundColor: '#FF6B6B',
  },
  previewActionText: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
    lineHeight: 20,
  },
});