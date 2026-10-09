import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// Pre-typed hooks. Plain useDispatch does not know about thunks and plain
// useSelector sees state as `unknown`; use these everywhere instead.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
