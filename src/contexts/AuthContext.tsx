import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

import { auth, db } from '../services/firebase'
import type { UserProfile } from '../types/user'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>
  login: (
    email: string,
    password: string
  ) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function getOrCreateProfile(
    firebaseUser: User,
    name?: string
  ): Promise<UserProfile> {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const snapshot = await getDoc(userRef)

    if (snapshot.exists()) {
      return snapshot.data() as UserProfile
    }

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: name ?? firebaseUser.displayName ?? '',
      role: 'customer',
    }

    await setDoc(userRef, newProfile)

    return newProfile
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)

      try {
        if (firebaseUser) {
          const userProfile = await getOrCreateProfile(firebaseUser)

          setUser(firebaseUser)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    await updateProfile(credential.user, {
      displayName: name,
    })

    const userProfile = await getOrCreateProfile(
      credential.user,
      name
    )

    setUser(credential.user)
    setProfile(userProfile)
  }

  async function login(
    email: string,
    password: string
  ) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()

    const credential = await signInWithPopup(auth, provider)

    const userProfile = await getOrCreateProfile(credential.user)

    setUser(credential.user)
    setProfile(userProfile)
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    )
  }

  return context
}

