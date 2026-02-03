'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiLoader, FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';
import { getProviderToken, getProviderData, setProviderAuth } from '@/lib/providerAuth';

function getPhotoUrl(photoPath) {
  if (!photoPath || typeof photoPath !== 'string') return null;
  // Support "images/xxx", "src/images/xxx", or plain "xxx"
  let clean = photoPath.trim();
  clean = clean.replace(/^src[/\\]images[/\\]/i, '').replace(/^images[/\\]/i, '').trim();
  if (!clean) return null;
  const encoded = clean.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `/api/images/${encoded}`;
}

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getProviderToken();
      const providerData = getProviderData();
      if (!token || !providerData?.id) {
        setMessage({ type: 'error', text: 'Not authenticated' });
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/provider/profile?providerId=${providerData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setName(data.profile.name || '');
        setPhotoLoadError(false);
        const token = getProviderToken();
        if (token) {
          setProviderAuth(token, { ...getProviderData(), name: data.profile.name, photoPath: data.profile.photoPath });
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load profile' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image (JPG, PNG or WebP)' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 3MB' });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const handleUpdatePhoto = async () => {
    if (!photoFile) {
      setMessage({ type: 'error', text: 'Select an image first' });
      return;
    }
    try {
      setSavingPhoto(true);
      setMessage({ type: '', text: '' });
      const token = getProviderToken();
      const formData = new FormData();
      formData.append('profilePhoto', photoFile);
      const response = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setProfile((p) => (p ? { ...p, photoPath: data.profile?.photoPath ?? p.photoPath } : p));
        setPhotoFile(null);
        setPhotoPreview(null);
        const auth = { token, provider: { ...getProviderData(), ...data.profile } };
        setProviderAuth(auth.token, auth.provider);
        setMessage({ type: 'success', text: 'Photo updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update photo' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update photo' });
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleSaveName = async () => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    try {
      setSavingName(true);
      setMessage({ type: '', text: '' });
      const token = getProviderToken();
      const response = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: trimmed })
      });
      const data = await response.json();
      if (data.success) {
        setProfile((p) => (p ? { ...p, name: data.profile?.name ?? trimmed } : p));
        const auth = { token, provider: { ...getProviderData(), name: data.profile?.name ?? trimmed } };
        setProviderAuth(auth.token, auth.provider);
        setMessage({ type: 'success', text: 'Name updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update name' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update name' });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Enter your current password' });
      return;
    }
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Enter a new password' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      setChangingPassword(true);
      setMessage({ type: '', text: '' });
      const token = getProviderToken();
      const response = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage({ type: 'success', text: 'Password changed successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const photoUrl = profile?.photoPath ? getPhotoUrl(profile.photoPath) : null;
  const displayPhotoUrl = photoPreview || (photoUrl && !photoLoadError ? photoUrl : null);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Update your photo, name and password</p>
      </div>

      {message.text && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Profile photo */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Profile photo</h2>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
                {displayPhotoUrl ? (
                  <img
                    src={displayPhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setPhotoLoadError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block">
                  <span className="sr-only">Choose photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-black file:text-white file:cursor-pointer hover:file:bg-gray-800"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP. Max 3MB.</p>
                {photoFile && (
                  <button
                    type="button"
                    onClick={handleUpdatePhoto}
                    disabled={savingPhoto}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {savingPhoto ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCamera className="w-4 h-4" />}
                    {savingPhoto ? 'Updating...' : 'Update photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Name</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Your name"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium text-sm inline-flex items-center gap-2"
              >
                {savingName ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                Save name
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Change password</h2>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium text-sm"
              >
                {changingPassword ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
                Change password
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">New password must be at least 6 characters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
