import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './pages/HomePage/HomePage';
import { checkHealth } from './redux/slices/healthSlice';
import { fetchFolders } from './redux/slices/folderSlice';

function App() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.settings.darkMode);

  useEffect(() => {
    dispatch(checkHealth());
    dispatch(fetchFolders());
  }, [dispatch]);

  return (
    <div className={`h-screen flex w-full font-sans antialiased transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <HomePage />
    </div>
  );
}

export default App;
