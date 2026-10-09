import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { cartReducer } from './cart-slice';
import { listenerMiddleware, logger } from './middleware';

const rootReducer = combineReducers({
  cart: cartReducer,
});

// A factory rather than a module-level `store`: on the server every request
// must get its own store, and every test gets a fresh one.
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    // The defaults already include thunk support plus development checks for
    // accidental mutation and non-serializable values.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(logger),
    devTools: process.env.NODE_ENV !== 'production',
  });
}

// Types are inferred from the store itself, so they update when slices do.
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
