import {useContext} from 'react';
import {UserContext} from './userContext';

export const useUserContext = () => {
  const userContext = useContext(UserContext);

  return userContext;
};
