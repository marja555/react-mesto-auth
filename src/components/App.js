import React, { useState } from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ConfirmPopup from "./ConfirmPopup";

function App() {
  const [cards, setCards] = useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState()
  const [currentUser, setCurrentUser] = useState(null);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleConfirmDeleteClick(cardData) {
    setIsConfirmDeletePopupOpen(true);
    setCardToDelete(cardData);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsConfirmDeletePopupOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(cardData) {
    setSelectedCard(cardData);
  }

  function handleUpdateUser(currentUser) {
    api.setUserInfo({name: currentUser.name, job: currentUser.about})
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch(err => `Не удалось обновить данные пользователя, ошибка: ${err}`)
  }

  function handleUpdateAvatar({avatar}) {
    api.editAvatar({avatar})
      .then((userData) => {
        setCurrentUser(userData)
      })
      .catch(err => `Не удалось обновить аватар, ошибка: ${err}`)
  }

  function handleCardLike(card) {
    // Проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch(err => `Не удалось обновить лайк, ошибка: ${err}`)
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => {
          return c._id !== card._id;
        }))
      })
      .catch(err => `Не удалось удалить карточку, ошибка: ${err}`)
  }

  function handleCreateCard({place, image}) {
    api.addCard({place, image})
      .then((newCard) => {
        setCards([newCard, ...cards]);
      })
      .catch(err => `Не удалось создать карточку, ошибка: ${err}`)
  }


  React.useEffect(() => {
    api.getInitialData()
      .then(([userData, cardsList]) => {
        setCurrentUser(userData);
        setCards(cardsList);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__container">
          <Header />
          <Main
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onConfirmDeleteClick={handleConfirmDeleteClick}
            onCardLike={handleCardLike}
            cards={cards}
          />
          <Footer />
        </div>
        <EditProfilePopup 
          isOpen={isEditProfilePopupOpen} 
          isClose={closeAllPopups} 
          onUpdateUser={handleUpdateUser} 
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen} 
          isClose={closeAllPopups}
          onCreateCard={handleCreateCard}
        />
        <ConfirmPopup
          isOpen={isConfirmDeletePopupOpen}
          isClose={closeAllPopups}
          onCardDelete={() => handleCardDelete(cardToDelete)}
        />
        <EditAvatarPopup 
          isOpen={isEditAvatarPopupOpen} 
          isClose={closeAllPopups} 
          onUpdateAvatar={handleUpdateAvatar} 
        />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} 
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
