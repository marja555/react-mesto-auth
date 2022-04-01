import React, { useState } from "react";
import Header from "./Header";
import Main from "./Main";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ConfirmPopup from "./ConfirmPopup";
import InfoToolTip from "./InfoTooltip";
import { Route, useHistory, Switch, Redirect } from 'react-router-dom';
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import auth from '../utils/auth';
import successfulRegist from '../images/Successful.svg';
import failedRegist from '../images/Failed.svg';

function App() {
  const [cards, setCards] = useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen] = useState(false);
  const [isTooltipPopupOpen, setIsTooltipPopupOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState()
  const [currentUser, setCurrentUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [messageTooltip, setMessageTooltip] = React.useState({});

  const history = useHistory();

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
    setIsTooltipPopupOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(cardData) {
    setSelectedCard(cardData);
  }

  function handleUpdateUser(currentUser) {
    api.setUserInfo({name: currentUser.name, job: currentUser.about})
      .then((userData) => {
        setCurrentUser({...currentUser, ...userData});
      })
      .catch(err => `Не удалось обновить данные пользователя, ошибка: ${err}`)
  }

  function handleUpdateAvatar({avatar}) {
    api.editAvatar({avatar})
      .then((userData) => {
        setCurrentUser({...currentUser, ...userData})
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
  function handleSubmitRegistration(data) {
    auth.registration(data)
      .then(({ email }) => {
        setCurrentUser({ ...currentUser, email })
        history.push('/sign-in')
        setIsTooltipPopupOpen(true)
        setMessageTooltip({ message: "Вы успешно зарегистрировались!", img: successfulRegist })
      })
      .catch((err) => {
        console.log(err);
        setIsTooltipPopupOpen(true)
        setMessageTooltip({ message: "Что-то пошло не так! Попробуйте еще раз.", img: failedRegist })

      })
  }
  function handleSubmitAuthorization(data) {
    auth.authorization(data)
      .then(({ token, email }) => {
        localStorage.setItem('jwt', token)
        setLoggedIn(true)
        setCurrentUser({...currentUser, email })
        history.push('/')
      })
      .catch((err) => {
        console.log(err);
        setIsTooltipPopupOpen(true)
        setMessageTooltip({ message: "Что-то пошло не так! Попробуйте еще раз.", img: failedRegist })
      })
  }

  function checkTocken() {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      setLoggedIn(true);
      auth.getUser(jwt)
        .then(({ data: { email } }) => {
          setCurrentUser({ ...currentUser, email })
        })
        .catch((err)=> console.log(err))
    }
  }

  function handleLogout() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    history.push('/sign-in');
  }

  React.useEffect(() => {
    checkTocken();
    if (loggedIn) {
      api.getInitialData()
        .then(([userData, cardsList]) => {
          setCurrentUser({...currentUser, ...userData});
          console.log(currentUser)
          setCards(cardsList);
       })
      .catch(err => console.log(err));
    }
  }, [loggedIn]);
  

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__container">
          <Header onLogout={handleLogout}/>
          <Switch>
            <ProtectedRoute exact path="/"
              loggedIn={loggedIn}
              component={Main}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onConfirmDeleteClick={handleConfirmDeleteClick}
              onCardLike={handleCardLike}
              cards={cards}
            />
          
            <Route path="/sign-up">
              {loggedIn ? <Redirect to='/' />
              : <Register onSubmit={handleSubmitRegistration}/>}
            </Route> 
            <Route path="/sign-in">
              {loggedIn ? <Redirect to='/' />
              : <Login onSubmit={handleSubmitAuthorization} />}
            </Route>
            <Route path="*">
              <Redirect to='/sign-in' />
            </Route>
          </Switch>
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
        <InfoToolTip
          name="infoTooltip"
          isOpen={isTooltipPopupOpen}
          messageTooltip={messageTooltip}
          onClose={closeAllPopups}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
