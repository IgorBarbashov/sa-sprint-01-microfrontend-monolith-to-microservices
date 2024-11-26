import React, {lazy, Suspense} from 'react';
import {UserContext, useUserContextValue} from '@shared-context/shared-library';

const UserApp = lazy(() => import('user/UserApp').catch(() => {
    return {default: () => <div className='error'>Component UserApp is not available!</div>};
  })
);

const CardApp = lazy(() => import('card/CardApp').catch(() => {
    return {default: () => <div className='error'>Component CardApp is not available!</div>};
  })
);

function Main() {
  const userContextValue = useUserContextValue();

  return (
    <UserContext.Provider value={userContextValue}>
      <main className="content">
        <Suspense>
          <UserApp />
        </Suspense>
        <Suspense>
          <CardApp />
        </Suspense>
      </main>
    </UserContext.Provider>
  );
}

export default Main;
