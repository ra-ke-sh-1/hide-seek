import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { ArrowLeft, Save, Play, Grid3x3 as Grid3X3, Undo, Redo, Share, FolderOpen, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWorldStore } from '@/stores/worldStore';
import GameCanvas from '@/components/game/GameCanvas';
import BlockPalette from '@/components/world/BlockPalette';
import { worldTemplates } from '@/utils/worldTemplates';

const { width, height } = Dimensions.get('window');

export default function WorldBuilderScreen() {
  const { 
    currentWorld, 
    selectedBlock, 
    setSelectedBlock, 
    addBlock, 
    saveWorld, 
    createWorld 
  } = useWorldStore();
  
  const [showGrid, setShowGrid] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [worldName, setWorldName] = useState(currentWorld?.name || 'Untitled World');
  const [worldDescription, setWorldDescription] = useState(currentWorld?.description || '');

  const gridSize = 20;
  const canvasHeight = 300;

  const handleBlockPlace = (x: number, y: number) => {
    if (!selectedBlock || !currentWorld) return;
    
    const newBlock = {
      id: `block_${Date.now()}`,
      type: selectedBlock,
      position: { x, y },
      rotation: 0,
      properties: {},
    };

    addBlock(newBlock);
  };

  const handleSaveWorld = () => {
    if (!currentWorld) {
      createWorld(worldName, worldDescription);
    } else {
      const updatedWorld = {
        ...currentWorld,
        name: worldName,
        description: worldDescription,
      };
      saveWorld(updatedWorld);
    }
    setShowSaveModal(false);
    Alert.alert('Success', 'World saved successfully!');
  };

  const handleTestWorld = () => {
    if (!currentWorld || currentWorld.blocks.length === 0) {
      Alert.alert('Empty World', 'Add some blocks to your world before testing!');
      return;
    }
    router.push('/game');
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = worldTemplates.find(t => t.id === templateId);
    if (template) {
      createWorld(template.name, template.description);
      // Apply template blocks would be implemented here
      setShowTemplateModal(false);
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
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.worldName}>{currentWorld?.name || 'New World'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction} 
            onPress={() => setShowTemplateModal(true)}
          >
            <FolderOpen size={20} color="#A0AEC0" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction} 
            onPress={() => setShowSaveModal(true)}
          >
            <Save size={20} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleTestWorld}>
            <Play size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <GameCanvas
          isEditing={true}
          onBlockPlace={handleBlockPlace}
          gridSize={gridSize}
          canvasHeight={canvasHeight}
        />
      </View>

      {/* Tools */}
      <View style={styles.toolsContainer}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 size={20} color={showGrid ? '#FF6B6B' : '#A0AEC0'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Undo size={20} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton}>
          <Redo size={20} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => Alert.alert(
            'Clear World',
            'Are you sure you want to clear all blocks?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', onPress: () => {/* Clear implementation */} }
            ]
          )}
        >
          <Text style={styles.toolText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Block Palette */}
      <BlockPalette
        selectedBlock={selectedBlock}
        onBlockSelect={setSelectedBlock}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowTemplateModal(true)}
        >
          <FolderOpen size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowSaveModal(true)}
        >
          <Share size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleTestWorld}
        >
          <Play size={16} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, styles.primaryActionText]}>Test Play</Text>
        </TouchableOpacity>
      </View>

      {/* Save Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save World</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>World Name</Text>
              <TextInput
                style={styles.textInput}
                value={worldName}
                onChangeText={setWorldName}
                placeholder="Enter world name"
                placeholderTextColor="#718096"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={worldDescription}
                onChangeText={setWorldDescription}
                placeholder="Describe your world..."
                placeholderTextColor="#718096"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveWorld}
              >
                <Text style={styles.saveButtonText}>Save World</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Template Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Template</Text>
            
            {worldTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleLoadTemplate(template.id)}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <Text style={styles.templateCategory}>{template.category}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowTemplateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
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
  worldName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  canvasContainer: {
    padding: 24,
    alignItems: 'center',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  toolText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 100,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templateCard: {
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  templateCategory: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});