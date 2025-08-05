import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import axios from 'axios';

// Define types
export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

export interface ISSCrew {
  name: string;
  craft: string;
}

interface ISSState {
  position: ISSPosition | null;
  crew: ISSCrew[];
  loading: boolean;
  error: string | null;
  followISS: boolean;
}

type ISSAction =
  | { type: 'FETCH_POSITION_START' }
  | { type: 'FETCH_POSITION_SUCCESS'; payload: ISSPosition }
  | { type: 'FETCH_POSITION_ERROR'; payload: string }
  | { type: 'FETCH_CREW_SUCCESS'; payload: ISSCrew[] }
  | { type: 'FETCH_CREW_ERROR'; payload: string }
  | { type: 'TOGGLE_FOLLOW_ISS' };

// Initial state
const initialState: ISSState = {
  position: null,
  crew: [],
  loading: false,
  error: null,
  followISS: true,
};

// Create context
const ISSContext = createContext<{
  state: ISSState;
  dispatch: React.Dispatch<ISSAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer function
const issReducer = (state: ISSState, action: ISSAction): ISSState => {
  switch (action.type) {
    case 'FETCH_POSITION_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_POSITION_SUCCESS':
      return {
        ...state,
        position: action.payload,
        loading: false,
        error: null,
      };
    case 'FETCH_POSITION_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'FETCH_CREW_SUCCESS':
      return {
        ...state,
        crew: action.payload,
      };
    case 'FETCH_CREW_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'TOGGLE_FOLLOW_ISS':
      return {
        ...state,
        followISS: !state.followISS,
      };
    default:
      return state;
  }
};

// Provider component
export const ISSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(issReducer, initialState);

  // Memoize the fetch functions to prevent recreation on every render
  const fetchISSPosition = useCallback(async () => {
    dispatch({ type: 'FETCH_POSITION_START' });
    try {
      const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
      dispatch({
        type: 'FETCH_POSITION_SUCCESS',
        payload: {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          altitude: response.data.altitude,
          velocity: response.data.velocity,
          timestamp: response.data.timestamp,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_POSITION_ERROR',
        payload: 'Failed to fetch ISS position data',
      });
    }
  }, []);

  const fetchISSCrew = useCallback(async () => {
    try {
      const response = await axios.get('https://api.open-notify.org/astros.json');
      const issCrew = response.data.people.filter(
        (person: ISSCrew) => person.craft === 'ISS'
      );
      dispatch({
        type: 'FETCH_CREW_SUCCESS',
        payload: issCrew,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_CREW_ERROR',
        payload: 'Failed to fetch ISS crew data',
      });
    }
  }, []);

  // Fetch ISS position data
  useEffect(() => {
    // Initial fetch
    fetchISSPosition();

    // Set up interval for periodic updates (every 5 seconds)
    const intervalId = setInterval(fetchISSPosition, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchISSPosition]);

  // Fetch ISS crew data (enabled now)
  // useEffect(() => {
  //   fetchISSCrew();
  // }, [fetchISSCrew]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
  }), [state, dispatch]);

  return (
    <ISSContext.Provider value={contextValue}>
      {children}
    </ISSContext.Provider>
  );
};

// Custom hook for using the ISS context
export const useISS = () => useContext(ISSContext);
