import React, { useState } from 'react';
import { UserPlus, Link, Phone, X, Copy, Check } from 'lucide-react';
import { addFriendByCode, addFriendByPhone } from '../utils/friends';
import { generateShareLink } from '../utils/auth';

interface AddFriendProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: () => void;
  currentUserId: string;
  shareCode: string;
}

export const AddFriend: React.FC<AddFriendProps> = ({
  isOpen,
  onClose,
  onFriendAdded,
  currentUserId,
  shareCode
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'share'>('add');
  const [method, setMethod] = useState<'code' | 'phone'>('code');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const shareLink = generateShareLink(shareCode);

  const handleAddFriend = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (method === 'code') {
        await addFriendByCode(input.trim(), currentUserId);
      } else {
        await addFriendByPhone(input.trim(), currentUserId);
      }
      
      setInput('');
      onFriendAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserPlus size={24} className="text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-800">Add Friends</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Friend
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Share Code
          </button>
        </div>

        {activeTab === 'add' ? (
          <div className="space-y-4">
            {/* Method Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setMethod('code')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  method === 'code'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Link size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Share Code</div>
              </button>
              <button
                onClick={() => setMethod('phone')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  method === 'phone'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Phone</div>
              </button>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {method === 'code' ? 'Friend\'s Share Code' : 'Friend\'s Phone Number'}
              </label>
              <input
                type={method === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={method === 'code' ? 'Enter 6-digit code' : 'Enter phone number'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={method === 'code' ? 6 : undefined}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleAddFriend}
              disabled={!input.trim() || isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Add Friend
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Share your code or link with friends</p>
              
              {/* Share Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Share Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 tracking-wider">
                    {shareCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(shareCode)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Link */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Or share this link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};