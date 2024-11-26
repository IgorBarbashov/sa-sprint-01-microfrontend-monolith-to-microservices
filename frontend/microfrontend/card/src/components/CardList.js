import React from 'react';
import Card from './Card';

export const CardList = ({cards, onCardClick, onCardLike, onCardDelete}) => (
  <ul className="places__list">
    {cards.map((card) => (
      <Card
        key={card._id}
        card={card}
        onCardClick={onCardClick}
        onCardLike={onCardLike}
        onCardDelete={onCardDelete}
      />
    ))}
  </ul>
);
