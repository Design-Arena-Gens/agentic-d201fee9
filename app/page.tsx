'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('dog, cute, pets, animals');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const generateAndUpload = async () => {
    setLoading(true);
    setStatus('Starting video generation...');
    setError('');
    setVideoUrl('');

    try {
      // Step 1: Generate video with Veo 3.1
      setStatus('Generating video with Veo 3.1...');
      const generateResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate video');
      }

      const { videoData, operationId } = await generateResponse.json();
      setStatus('Video generated! Preparing for upload...');

      // Step 2: Upload to YouTube
      setStatus('Uploading to YouTube...');
      const uploadResponse = await fetch('/api/upload-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData,
          title: title || 'Adorable Dog Video',
          description: description || 'AI-generated dog video created with Veo 3.1',
          tags: tags.split(',').map(t => t.trim()),
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to YouTube');
      }

      const { videoId, videoUrl: ytUrl } = await uploadResponse.json();
      setVideoUrl(ytUrl);
      setStatus(`Success! Video uploaded to YouTube: ${videoId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🐕 Dog Video Factory
            </h1>
            <p className="text-gray-600">
              Generate AI videos of dogs with Veo 3.1 and upload to YouTube Shorts
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A golden retriever puppy playing in a sunny park, chasing a butterfly, slow motion, cinematic"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Adorable Golden Retriever Puppy Playing"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Watch this adorable AI-generated dog video!"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="dog, cute, pets, animals"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={generateAndUpload}
              disabled={loading || !prompt}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? '⏳ Processing...' : '🎬 Generate & Upload Video'}
            </button>

            {status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{status}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            {videoUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 mb-2">✅ Video successfully uploaded!</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline font-medium"
                >
                  🎥 Watch on YouTube →
                </a>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Example Prompts:
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• "A corgi running on the beach at sunset, waves crashing, cinematic"</p>
              <p>• "Husky puppy playing in snow, slow motion, 4K quality"</p>
              <p>• "French bulldog doing tricks, indoor studio lighting"</p>
              <p>• "Labrador puppy sleeping peacefully, soft lighting"</p>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚙️ <strong>Setup Required:</strong> Configure your Google API key (for Veo 3.1) and YouTube API credentials in the environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
