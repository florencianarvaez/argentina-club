import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { User } from 'firebase/auth'

import { AuthProvider, useAuth } from './AuthContext'

const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: mocks.signOut,
  updateProfile: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'mock-user-reference'),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}))

const mockUser = {
  uid: 'usuario-123',
  email: 'cliente@test.com',
  displayName: 'Cliente de prueba',
} as User

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.onAuthStateChanged.mockImplementation(
      (_auth, callback) => {
        callback(null)
        return vi.fn()
      }
    )

    mocks.signOut.mockResolvedValue(undefined)
  })

  it('inicia sin usuario autenticado', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('carga el perfil de un usuario autenticado', async () => {
    mocks.onAuthStateChanged.mockImplementation(
      (_auth, callback) => {
        callback(mockUser)
        return vi.fn()
      }
    )

    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: 'usuario-123',
        email: 'cliente@test.com',
        displayName: 'Cliente de prueba',
        role: 'customer',
      }),
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user?.uid).toBe('usuario-123')
    })

    expect(result.current.profile?.role).toBe('customer')
  })

  it('crea un perfil customer si el usuario no tiene perfil', async () => {
    mocks.onAuthStateChanged.mockImplementation(
      (_auth, callback) => {
        callback(mockUser)
        return vi.fn()
      }
    )

    mocks.getDoc.mockResolvedValue({
      exists: () => false,
    })

    mocks.setDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.profile?.role).toBe('customer')
    })

    expect(mocks.setDoc).toHaveBeenCalledWith(
      'mock-user-reference',
      expect.objectContaining({
        uid: 'usuario-123',
        role: 'customer',
      })
    )
  })

  it('cierra la sesión correctamente', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.logout()

    expect(mocks.signOut).toHaveBeenCalledOnce()
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('lanza un error si useAuth se utiliza fuera de AuthProvider', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    try {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth debe utilizarse dentro de AuthProvider'
      )
    } finally {
      consoleSpy.mockRestore()
    }
  })
})

