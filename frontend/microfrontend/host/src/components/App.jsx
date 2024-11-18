import React, {lazy, Suspense} from "react";
import {Switch, useHistory} from 'react-router-dom';
import {AuthContext, useAuthContextValue} from '@shared-context/shared-library';
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";
import "../index.css";

const AuthApp = lazy(() => import('auth/AuthApp').catch(() => {
    return {default: () => <div className='error'>Component AuthApp is not available!</div>};
  })
);

export const App = () => {
  const history = useHistory();
  const authContextValue = useAuthContextValue();
  const {email, setEmail, isLoggedIn, setIsLoggedIn} = authContextValue;

  function onSignOut() {
    localStorage.removeItem("jwt");
    setEmail('');
    setIsLoggedIn(false);
    history.push("/signin");
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />

        <Suspense>
          <AuthApp />
        </Suspense>

        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            loggedIn={isLoggedIn}
          />
        </Switch>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}
