import React from 'react';

const {SuccessIcon, ErrorIcon} = await import('ui_kit/icons');

function InfoTooltip({isOpen, onClose, status}) {
  const Icon = status === 'success' ? SuccessIcon : ErrorIcon;
  const text = status === 'success'
    ? "Вы успешно зарегистрировались"
    : "Что-то пошло не так! Попробуйте ещё раз.";

  return (
    <div className={`popup ${isOpen && 'popup_is-opened'}`}>
      <div className="popup__content">
        <form className="popup__form" noValidate>
          <button type="button" className="popup__close" onClick={onClose}></button>
          <div>
            <Icon className="popup__icon" />
            <p className="popup__status-message">{text}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InfoTooltip;
