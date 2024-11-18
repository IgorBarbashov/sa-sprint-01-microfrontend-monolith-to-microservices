import {useState, useEffect} from 'react';
import {useUserContext} from '@shared-context/shared-library';
import Profile from './Profile';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import api from '../api/user';
import "../index.css";

export default function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const {currentUser, setCurrentUser} = useUserContext();

  useEffect(() => {
    api
      .getUserInfo()
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleCloseEditAvatarPopup() {
    setIsEditAvatarPopupOpen(false);
  }

  function handleUpdateAvatar(avatarUpdate) {
    api
      .setUserAvatar(avatarUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        handleCloseEditAvatarPopup();
      })
      .catch(console.error);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleCloseEditProfilePopup() {
    setIsEditProfilePopupOpen(false);
  }

  function handleUpdateUser(userUpdate) {
    api
      .setUserInfo(userUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        handleCloseEditProfilePopup();
      })
      .catch(console.error);
  }

  function handleAddPlaceClick() {
    window.dispatchEvent(new Event('addNewPlace'));
  }

  return (
    <div className="container">
      <Profile
        currentUser={currentUser}
        onEditProfile={handleEditProfileClick}
        onEditAvatar={handleEditAvatarClick}
        onAddPlace={handleAddPlaceClick}
      />

      <EditProfilePopup
        currentUser={currentUser}
        isOpen={isEditProfilePopupOpen}
        onUpdateUser={handleUpdateUser}
        onClose={handleCloseEditProfilePopup}
      />

      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onUpdateAvatar={handleUpdateAvatar}
        onClose={handleCloseEditAvatarPopup}
      />
    </div>
  );
};
