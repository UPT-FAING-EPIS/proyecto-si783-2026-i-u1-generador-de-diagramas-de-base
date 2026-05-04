'use client'

import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import { createClient } from '@fluxsql/backend/supabase/client'
import { updateUserProfile } from '@fluxsql/backend/actions/profile/update'
import { getInitials, getAvatarColor } from '@/lib/utils/avatar'

interface ProfileFormProps {
  userId: string
  initialName: string
  initialEmail: string
  initialAvatarUrl: string | null
}

export function ProfileForm({ userId, initialName, initialEmail, initialAvatarUrl }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Solo se aceptan PNG, JPG o WEBP' })
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp'
      const path = `${userId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const urlWithBust = `${data.publicUrl}?t=${Date.now()}`
      setAvatarUrl(urlWithBust)
      await updateUserProfile({ userId, avatarUrl: data.publicUrl })
      setMessage({ type: 'success', text: 'Foto actualizada correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al subir la foto. Intenta de nuevo.' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      await updateUserProfile({ userId, name: name.trim() })
      setMessage({ type: 'success', text: 'Nombre actualizado correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#0D1117', border: '1px solid #1E2A45' }}>
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: '3px solid #1E2A45' }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: getAvatarColor(name || initialName), border: '3px solid #1E2A45' }}
            >
              {getInitials(name || initialName)}
            </div>
          )}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            {uploading ? (
              <span className="text-white text-xs">Subiendo...</span>
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Haz clic en la foto para cambiarla · PNG, JPG o WEBP
        </p>
      </div>

      {/* Formulario nombre */}
      <form onSubmit={handleSaveName} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-colors"
            style={{ backgroundColor: '#111827', border: '1px solid #1E2A45' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2A45')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7280' }}>
            Correo electrónico
          </label>
          <input
            type="email"
            value={initialEmail}
            disabled
            className="w-full px-3 py-2.5 rounded-lg text-sm cursor-not-allowed"
            style={{ backgroundColor: '#0D1117', border: '1px solid #1E2A45', color: '#4B5563' }}
          />
          <p className="text-xs mt-1" style={{ color: '#4B5563' }}>El correo no se puede cambiar</p>
        </div>

        {message && (
          <div
            className="text-sm px-3 py-2 rounded-lg"
            style={{
              backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: message.type === 'success' ? '#10B981' : '#EF4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#1A6CF6' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
