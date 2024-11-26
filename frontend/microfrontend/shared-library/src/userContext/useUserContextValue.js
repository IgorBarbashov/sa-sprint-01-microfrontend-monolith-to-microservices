import {useMemo, useState} from 'react';

export const useUserContextValue = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const userContextValue = useMemo(() => ({
    currentUser,
    setCurrentUser
  }), [currentUser, setCurrentUser]);

  return userContextValue;
}
