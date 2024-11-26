import {useMemo, useState} from 'react';

export const useAuthContextValue = () => {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const authContextValue = useMemo(() => ({
    email,
    setEmail,
    isLoggedIn,
    setIsLoggedIn
  }), [email, setEmail, isLoggedIn, setIsLoggedIn]);

  return authContextValue;
}
