import React from 'react';
import logoPath from '../images/logo.svg';
import { Route, Link } from 'react-router-dom';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { useContext } from 'react';

function Header(props) {
 const currentUser = useContext(CurrentUserContext);
  

  return (
    <header className="header">
      <img src={logoPath} className="header__logo" alt="Логотип" />
      <Route path="/sign-up">
        <Link className="auth__route-link" to="/sign-in">Войти</Link>
      </Route>
      <Route path="/sign-in">
        <Link to="/sign-up" className="auth__route-link">Регистрация</Link>
      </Route>
      <p className="header__email">{currentUser?.email}</p>
      <Route path='/'>
        <Link to='/sign-in' className="auth__route-link" onClick={props.onLogout}>Выйти</Link>
      </Route>
    </header>
  );
}

export default Header;