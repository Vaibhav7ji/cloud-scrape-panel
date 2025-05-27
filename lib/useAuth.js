// lib/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../pages/_app'; // Adjust path if needed
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export function useAuth() {
  const { user } = useContext(AuthContext);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return { user, login, logout };
}
