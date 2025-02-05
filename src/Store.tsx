import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../src/authSlice';
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Combine reducers
const rootReducer = combineReducers({

  auth: authReducer,
});


const persistConfig = {
  key: "root", // Key for AsyncStorage
  storage: AsyncStorage, // Use AsyncStorage for React Native
  whitelist:['auth'],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignore serializable warnings for persistence
    }),
});

// // Create persistor
 export const persistor = persistStore(store);

// import { configureStore, combineReducers } from '@reduxjs/toolkit';
// import authReducer from '../src/authSlice';

// // Combine reducers
// const rootReducer = combineReducers({
//   auth: authReducer,
// });

// // Configure the store without persistence
// export const store = configureStore({
//   reducer: rootReducer,
// });
