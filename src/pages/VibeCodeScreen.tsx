import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wand2, RefreshCw, Download, Edit3, Brain } from 'lucide-react';
import { useWorldStore } from '../stores/worldStore';

export default function VibeCodeScreen() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorld, setGeneratedWorld] = useState<any>(null);
  const { generateFromPrompt, saveWorld } = useWorldStore();
  
  const suggestions = [
    'A spooky haunted mansion with secret passages',
    'A futuristic space station with teleporter rooms',
    'A cozy coffee shop with multiple hiding spots',
    'An underwater research facility with glass tunnels',
    'A medieval castle with towers and secret dungeons',
    'A bustling marketplace with vendor stalls and alleys',
  ];

  const generateWorld = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const world = await generateFromPrompt(prompt);
      setGeneratedWorld(world);
    } catch (error) {
      alert('Failed to generate world. Please try again.');
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
    navigate('/world-builder');
  };

  const handleSaveWorld = () => {
    if (generatedWorld) {
      saveWorld(generatedWorld);
      alert('World saved to your collection!');
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button 
          className="button secondary"
          style={{ padding: '8px 16px' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Vibe Code</h1>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {/* Description */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <Brain size={32} color="#FFE66D" />
            <Sparkles size={20} color="#4ECDC4" style={{ position: 'absolute', top: '-5px', right: '-5px' }} />
          </div>
          <p style={{ color: '#a0aec0', lineHeight: '24px' }}>
            Describe your dream hide-and-seek world, and AI will bring it to life in seconds!
          </p>
        </div>

        {/* Input Section */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
            Describe your world
          </label>
          <textarea
            placeholder="e.g., A magical forest with treehouse hideouts, glowing mushrooms, and secret underground tunnels connecting different areas..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              backgroundColor: '#2d3748',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: '#ffffff',
              fontSize: '16px',
              marginBottom: '16px',
              resize: 'vertical'
            }}
          />
          
          <button 
            className="button"
            style={{ 
              width: '100%',
              backgroundColor: !prompt.trim() || isGenerating ? '#4a5568' : '#ff6b6b',
              opacity: !prompt.trim() || isGenerating ? 0.6 : 1
            }}
            onClick={generateWorld}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid #ffffff', 
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating Magic...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate World
              </>
            )}
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
            Need inspiration? Try these:
          </h3>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="card"
              style={{ cursor: 'pointer', marginBottom: '8px' }}
              onClick={() => setPrompt(suggestion)}
            >
              <p style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '20px' }}>
                {suggestion}
              </p>
            </div>
          ))}
        </div>

        {/* Generated World Preview */}
        {generatedWorld && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Sparkles size={20} color="#4ECDC4" />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '8px' }}>
                Your Generated World
              </h3>
            </div>
            <div className="card">
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ECDC4', marginBottom: '8px' }}>
                {generatedWorld.name}
              </h4>
              <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '16px', lineHeight: '20px' }}>
                {generatedWorld.description}
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                  🧱 {generatedWorld.blocks.length} blocks
                </p>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                  📍 {generatedWorld.spawnPoints.length} spawns
                </p>
                <p style={{ fontSize: '12px', color: '#718096' }}>
                  🎯 {generatedWorld.tags.join(', ')}
                </p>
              </div>

              {/* Mini Canvas */}
              <div style={{
                width: '100%',
                height: '120px',
                backgroundColor: '#1a202c',
                borderRadius: '8px',
                position: 'relative',
                marginBottom: '16px'
              }}>
                {generatedWorld.blocks.slice(0, 20).map((block: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: block.position.x / 3,
                      top: block.position.y / 3,
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: getBlockColor(block.type),
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  className="button secondary"
                  style={{ padding: '8px 16px' }}
                  onClick={regenerateWorld}
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
                
                <button 
                  className="button secondary"
                  style={{ padding: '8px 16px', backgroundColor: '#4ecdc4' }}
                  onClick={editWorld}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                
                <button 
                  className="button"
                  style={{ padding: '8px 16px' }}
                  onClick={handleSaveWorld}
                >
                  <Download size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
            Pro Tips
          </h3>
          <div className="card">
            <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px', lineHeight: '20px' }}>
              💡 Be specific about themes and atmosphere
            </p>
            <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px', lineHeight: '20px' }}>
              🕳️ Mention hiding spots you want (lockers, vents, secret rooms)
            </p>
            <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px', lineHeight: '20px' }}>
              🏗️ Describe the setting (school, park, spaceship, castle)
            </p>
            <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px', lineHeight: '20px' }}>
              🎨 Add details about colors, lighting, and mood
            </p>
            <p style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '20px' }}>
              ⚡ Include interactive elements (doors, elevators, switches)
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
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