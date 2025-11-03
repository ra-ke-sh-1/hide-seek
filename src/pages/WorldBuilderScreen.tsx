import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, Grid, Undo, Redo, FolderOpen } from 'lucide-react';
import { useWorldStore } from '../stores/worldStore';
import Navigation from '../components/Navigation';

const blockTypes = [
  { id: 'wall', emoji: '🧱', name: 'Wall' },
  { id: 'door', emoji: '🚪', name: 'Door' },
  { id: 'tree', emoji: '🌳', name: 'Tree' },
  { id: 'car', emoji: '🚗', name: 'Car' },
  { id: 'building', emoji: '🏢', name: 'Building' },
  { id: 'locker', emoji: '🗄️', name: 'Locker' },
  { id: 'barrel', emoji: '🛢️', name: 'Barrel' },
];

export default function WorldBuilderScreen() {
  const navigate = useNavigate();
  const { 
    currentWorld, 
    selectedBlock, 
    setSelectedBlock, 
    addBlock, 
    saveWorld, 
    createWorld,
    savedWorlds,
    loadSavedWorlds
  } = useWorldStore();
  
  const [showGrid, setShowGrid] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(!currentWorld);
  const [worldName, setWorldName] = useState(currentWorld?.name || '');
  const [worldDescription, setWorldDescription] = useState(currentWorld?.description || '');
  const [showWorldsList, setShowWorldsList] = useState(false);

  React.useEffect(() => {
    loadSavedWorlds();
  }, []);

  const gridSize = 20;
  const canvasWidth = Math.min(window.innerWidth - 32, 600);
  const canvasHeight = Math.min(window.innerHeight - 300, 400);

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

  const handleCreateWorld = () => {
    if (!worldName.trim()) {
      alert('Please enter a world name');
      return;
    }
    
    createWorld(worldName, worldDescription);
    setShowCreateForm(false);
  };

  const handleSaveWorld = () => {
    if (!currentWorld) return;
    
    const updatedWorld = {
      ...currentWorld,
      name: worldName || currentWorld.name,
      description: worldDescription || currentWorld.description,
    };
    saveWorld(updatedWorld);
    alert('World saved successfully!');
  };

  const handleTestWorld = () => {
    if (!currentWorld || currentWorld.blocks.length === 0) {
      alert('Add some blocks to your world before testing!');
      return;
    }
    navigate(`/game?mode=ai&world=${currentWorld.id}`);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedBlock) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridX = Math.floor(x / gridSize) * gridSize;
    const gridY = Math.floor(y / gridSize) * gridSize;
    
    handleBlockPlace(gridX, gridY);
  };

  const getBlockColor = (type: string) => {
    const colors: { [key: string]: string } = {
      wall: '#8B5CF6',
      door: '#F59E0B',
      tree: '#10B981',
      car: '#EF4444',
      building: '#6B7280',
      locker: '#EC4899',
      barrel: '#F97316',
    };
    return colors[type] || '#4a5568';
  };

  // Show create form if no current world
  if (showCreateForm) {
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '32px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Create New World
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '8px'
              }}>
                World Name *
              </label>
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="Enter world name"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  background: '#ffffff',  // White background for better contrast
                  border: '2px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#0F172A',  // Darker text for better contrast
                  outline: 'none',
                  fontWeight: '500'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '8px'
              }}>
                Description (optional)
              </label>
              <textarea
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                placeholder="Describe your world..."
                rows={3}
                className="world-input"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '14px',
                  resize: 'vertical',
                  background: '#ffffff',  // White background for better contrast
                  border: '2px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#0F172A',  // Darker text for better contrast
                  outline: 'none',
                  fontWeight: '500',
                  lineHeight: '1.5'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="button secondary"
                style={{ flex: 1 }}
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button 
                className="button"
                style={{ 
                  flex: 1,
                  opacity: worldName.trim() ? 1 : 0.6
                }}
                onClick={handleCreateWorld}
                disabled={!worldName.trim()}
              >
                Create World
              </button>
            </div>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button 
          className="button secondary"
          style={{ padding: '12px 16px' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div style={{ flex: 1, textAlign: 'center' }}>
          <input
            type="text"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            placeholder="World Name"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              maxWidth: '200px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="button accent"
            style={{ padding: '12px 16px', fontSize: '14px' }}
            onClick={handleSaveWorld}
          >
            <Save size={16} />
            Save
          </button>
          <button 
            className="button"
            style={{ padding: '12px 16px', fontSize: '14px' }}
            onClick={handleTestWorld}
          >
            <Play size={16} />
            Test
          </button>
        </div>
      </div>

      {/* Block Palette */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        gap: '12px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <span style={{ 
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontWeight: 'bold',
          minWidth: 'fit-content'
        }}>
          Blocks:
        </span>
        {blockTypes.map((block) => (
          <button
            key={block.id}
            title={block.name}
            className={selectedBlock === block.id ? 'button' : 'button secondary'}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              fontSize: '20px',
              padding: '8px',
              minWidth: '50px',
              flexShrink: 0
            }}
            onClick={() => setSelectedBlock(block.id)}
          >
            {block.emoji}
          </button>
        ))}
        <button
          className="button secondary"
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            minWidth: 'fit-content',
            marginLeft: '8px'
          }}
          onClick={() => setShowGrid(!showGrid)}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      {/* Canvas */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        minHeight: 0
      }}>
        <div
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            cursor: selectedBlock ? 'crosshair' : 'default',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid */}
          {showGrid && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              opacity: 0.5
            }} />
          )}

          {/* Render Blocks */}
          {currentWorld?.blocks?.map((block) => (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: `${block.position.x}px`,
                top: `${block.position.y}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                background: getBlockColor(block.type),
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Could add block removal on click
              }}
            >
              {blockTypes.find(bt => bt.id === block.type)?.emoji}
            </div>
          ))}

          {/* Instructions overlay */}
          {!selectedBlock && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Select a block type above to start building
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: 'rgba(45, 55, 72, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <span>
          {currentWorld?.blocks?.length || 0} blocks placed
        </span>
        <span>
          {selectedBlock ? `Selected: ${blockTypes.find(b => b.id === selectedBlock)?.name}` : 'No block selected'}
        </span>
      </div>

      <Navigation />
    </div>
  );
}