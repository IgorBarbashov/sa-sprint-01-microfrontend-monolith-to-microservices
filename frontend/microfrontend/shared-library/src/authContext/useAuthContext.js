import {useContext} from 'react';
import {AuthContext} from './authContext';

export const useAuthContext = () => {
  const authContext = useContext(AuthContext);

  return authContext;
};
