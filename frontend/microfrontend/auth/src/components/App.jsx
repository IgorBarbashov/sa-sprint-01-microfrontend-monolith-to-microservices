import {useEffect, useState} from 'react';
import {Route, Switch, useHistory} from 'react-router-dom';
import {useAuthContext} from '@shared-context/shared-library';
import {checkToken, login, register} from '../api/auth';
import Login from './Login';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import '../styles/auth-form/auth-form.css';

export default function App() {
  const history = useHistory();
  const {setIsLoggedIn, setEmail} = useAuthContext();

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false);
  const [tooltipStatus, setTooltipStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.error(err);
        });
    }
  }, []);

  function onRegister({email, password}) {
    register(email, password)
      .then(() => {
        setTooltipStatus("success");
        setIsInfoToolTipOpen(true);
        history.push("/signin");
      })
      .catch(() => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  function onLogin({email, password}) {
    login(email, password)
      .then(() => {
        setIsLoggedIn(true);
        setEmail(email);
        history.push("/");
      })
      .catch(() => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  return (
    <>
      <Switch>
        <Route path="/signup">
          <Register onRegister={onRegister} />
        </Route>

        <Route path="/signin">
          <Login onLogin={onLogin} />
        </Route>
      </Switch>

      <InfoTooltip
        isOpen={isInfoToolTipOpen}
        onClose={() => setIsInfoToolTipOpen(false)}
        status={tooltipStatus}
      />
    </>
  );
};
