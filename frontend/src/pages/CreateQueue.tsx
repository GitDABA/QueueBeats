import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Navigation } from "../components/Navigation";
import { useAuth } from "../utils/auth";
import { createQueue, QueueSettings } from "../utils/queueHelpers";

export default function CreateQueue() {
  return (
    <AuthInit>
      <AuthProvider>
        <ProtectedRoute>
          <CreateQueueContent />
        </ProtectedRoute>
      </AuthProvider>
    </AuthInit>
  );
}

function CreateQueueContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdQueueId, setCreatedQueueId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState<QueueSettings>({
    isPublic: true,
    allowGuestAddSongs: true,
    maxVotesPerUser: 3,
    requireApproval: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!name.trim()) {
      setError("Please enter a name for your queue");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const queue = await createQueue(
        user.id,
        name,
        description,
        settings
      );
      
      setCreatedQueueId(queue.id);
      setAccessCode(queue.access_code);
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Error creating queue:", err);
      setError(err.message || "Failed to create queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof QueueSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Music Queue</h1>
            <p className="text-muted-foreground">
              Set up a new queue for your party or event. Guests will be able to suggest songs and vote for their favorites.
            </p>
          </div>

          {success && createdQueueId && accessCode ? (
            <div className="bg-black/30 border border-green-500/30 p-8 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-500/20 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6">Queue Created Successfully!</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Queue Access Code</h3>
                  <div className="flex items-center justify-between p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                    <div className="text-2xl font-mono tracking-wider text-purple-400">{accessCode}</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(accessCode)}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Share this code with your guests so they can join the queue.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Shareable Link</h3>
                  <div className="flex items-center justify-between p-4 bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden">
                    <div className="text-sm text-purple-400 truncate">
                      {`${window.location.origin}/join-queue?code=${accessCode}`}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/join-queue?code=${accessCode}`)}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Or share this link for direct access to your queue.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="default"
                    onClick={() => navigate(`/queue/${createdQueueId}`)}
                  >
                    Go to Queue
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-black/30 border border-border p-8 rounded-xl backdrop-blur-sm">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Queue Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Weekend Party"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="House party at John's place. Keep it groovy!"
                    rows={3}
                    disabled={loading}
                  />
                </div>
                
                <div className="pt-4 border-t border-border/30">
                  <h3 className="text-lg font-semibold mb-4">Queue Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Queue Privacy</h4>
                        <p className="text-sm text-muted-foreground">Control who can access your queue</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md ${settings.isPublic ? 'bg-purple-500 text-white' : 'bg-black/50 text-muted-foreground'}`}
                          onClick={() => handleSettingChange('isPublic', true)}
                          disabled={loading}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded-md ${!settings.isPublic ? 'bg-purple-500 text-white' : 'bg-black/50 text-muted-foreground'}`}
                          onClick={() => handleSettingChange('isPublic', false)}
                          disabled={loading}
                        >
                          Private
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Guest Song Submissions</h4>
                        <p className="text-sm text-muted-foreground">Allow guests to add songs to the queue</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="allowGuestAddSongs"
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={settings.allowGuestAddSongs}
                          onChange={(e) => handleSettingChange('allowGuestAddSongs', e.target.checked)}
                          disabled={loading}
                        />
                        <label htmlFor="allowGuestAddSongs" className="ml-2 text-sm">Enabled</label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Votes Per Guest</h4>
                        <p className="text-sm text-muted-foreground">Maximum votes each guest can cast</p>
                      </div>
                      <div>
                        <select
                          value={settings.maxVotesPerUser || 3}
                          onChange={(e) => handleSettingChange('maxVotesPerUser', parseInt(e.target.value))}
                          className="bg-black/50 border border-border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={loading}
                        >
                          {[1, 2, 3, 5, 10, 15].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                          <option value="999">Unlimited</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Song Approval</h4>
                        <p className="text-sm text-muted-foreground">Require your approval before songs appear in the queue</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="requireApproval"
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={settings.requireApproval}
                          onChange={(e) => handleSettingChange('requireApproval', e.target.checked)}
                          disabled={loading}
                        />
                        <label htmlFor="requireApproval" className="ml-2 text-sm">Required</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="glow"
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Queue...' : 'Create Queue'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
