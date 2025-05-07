'use client';

import { Provider } from 'react-redux';
import store from '../store/store';
import { useEffect } from 'react';
import { fetchCurrentUser } from '../store/thunks/userThunk'; // adjust path if needed
import { useDispatch } from 'react-redux';


function ReduxInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ReduxInitializer>{children}</ReduxInitializer>
    </Provider>
  );
}
