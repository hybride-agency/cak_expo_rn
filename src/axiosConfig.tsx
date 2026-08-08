import {create} from 'axios';
import {Alert} from 'react-native';
import { store } from './store';
import { clearAuthSession } from './utils/authSession';
import { logout } from './slice/LoginSlice';
import { clearUser } from './slice/SignUpSlice';
import { setIsPlan, setIsQuestion, setIsWelcome } from './slice/WelcomeSlice';
import {environment} from './config/env';
// import realmStorage from '../storage/realm/realmStorage';
// import {UserState} from './types';
// import {store} from '../storage/redux/store';
// import {clearUser} from '../storage/redux/reducers/userSlice';

// Error modal queue management
let errorQueue: {message: string; callback?: () => void}[] = [];
let isErrorModalShowing = false;
interface GlobalModalConfig {
  type: 'alert';
  props: {
    icon: string;
    iconColor: string;
    title: string;
    message: string;
    buttonText: string;
  };
  onClose: () => void;
}

let globalShowModal: ((config: GlobalModalConfig) => void) | null = null;
let has401ErrorShown = false; // Track if 401 error has already been shown

// Function to set the global modal function
export const setGlobalModalFunction = (showModal: (config: GlobalModalConfig) => void) => {
  globalShowModal = showModal;
};

// Function to reset 401 error flag (useful for new login sessions)
export const reset401ErrorFlag = () => {
  has401ErrorShown = false;
};

// Function to show error modal with queue management
const showErrorModal = (message: string, customCallback?: () => void) => {
  if (!globalShowModal) {
    Alert.alert('Error', message, [
      {text: 'OK', onPress: customCallback},
    ]);
    return;
  }

  // Add error to queue with optional callback
  errorQueue.push({message, callback: customCallback});
  
  // If no modal is currently showing, show the first error
  if (!isErrorModalShowing && errorQueue.length > 0) {
    processErrorQueue();
  }
};

const processErrorQueue = () => {
  if (!globalShowModal || errorQueue.length === 0) {
    isErrorModalShowing = false;
    return;
  }

  isErrorModalShowing = true;
  const errorItem = errorQueue.shift(); // Remove first error from queue

  if (!errorItem) {
    isErrorModalShowing = false;
    return;
  }

  globalShowModal({
    type: 'alert',
    props: {
      icon: 'alert-circle',
      iconColor: '#FF6B6B',
      title: 'Error',
      message: errorItem.message,
      buttonText: 'OK',
    },
    onClose: () => {
      isErrorModalShowing = false;
      
      // Execute custom callback if provided
      if (errorItem.callback) {
        errorItem.callback();
      }
      
      // Process next error in queue after a small delay
      setTimeout(() => {
        if (errorQueue.length > 0) {
          processErrorQueue();
        }
      }, 300);
    },
  });
};

// Create axios instance with better configuration
const axiosInstance = create({
  baseURL: environment.apiBaseUrl,
  timeout: 30000, // Increased timeout to 30 seconds for production
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Optional: Add auth token to headers dynamically
axiosInstance.interceptors.request.use(
  async config => {
    // adding the token if the user exists in the local database
    const state = store.getState();
    const user = state.signUp;

    if (user && user.token) {
      config.headers.Authorization = 'Bearer ' + user.token;
    }

    // Get language from realm storage and add to headers
    // try {
    //   const savedLanguage = await realmStorage.getItem('appLanguage');
    //   const language = savedLanguage || 'en'; // Default to 'en' if no saved language
    //   config.headers['language'] = language;
    // } catch (error) {
    //   console.log('Failed to get language from realm storage:', error);
    //   // Default to English if there's an error
    //   config.headers['language'] = 'en';
    // }

    // 🔧 If the request payload is FormData, adjust headers accordingly
    // In React-Native FormData instances don't inherit from the browser's FormData
    // so we additionally check for the _parts property that exists on RN FormData.
    if (
      (config.data && config.data instanceof FormData) ||
      (config.data && config.data._parts)
    ) {
      // Remove any previously set content-type so axios can attach the correct
      // multipart boundary. Setting it explicitly without a boundary can break
      // the request.
      delete config.headers['Content-Type'];
      // Accept JSON in the response but let axios define the multipart boundary
      config.headers.Accept = 'application/json';
    }

    return config;
  },
  error => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Optional: Response interceptor for error logging or global error handling
// Add a response interceptor with retry logic
axiosInstance.interceptors.response.use(
  function (response) {
    return {...response};
  },
  async function (error) {
    const originalRequest = error.config;

    console.log('axios error:', error.message);
    console.log('axios error URL:', originalRequest?.url);
    console.log('axios error response:', error.response);

    // Handle network errors with retry logic for production
    if (error.message === 'Network Error' && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('Retrying request due to network error...');
      
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return axiosInstance(originalRequest);
    }

    // Show error modal for various error types
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let shouldShowModal = true;
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Bad request. Please check your input.';
          break;
        case 422:
          errorMessage = data?.message || 'Validation failed. Please check your input.';
          if (data?.errors) {
            const firstErrorKey = Object.keys(data.errors)[0];
            if (firstErrorKey) {
              errorMessage = data.errors[firstErrorKey][0];
            }
          }
          break;
        case 401:
          errorMessage = 'Authentication failed. Please log in again.';
          clearAuthSession().catch(sessionError => {
            console.log('Failed to clear saved auth session:', sessionError);
          });
          store.dispatch(logout());
          store.dispatch(clearUser());
          store.dispatch(setIsQuestion(false));
          store.dispatch(setIsPlan(false));
          store.dispatch(setIsWelcome(true));
          // Handle 401 with logout functionality - only show once
          if (!has401ErrorShown) {
            has401ErrorShown = true;
            showErrorModal(errorMessage, () => {
              // store.dispatch(clearUser());
              // Reset flag after logout so it can show again on next login session
              has401ErrorShown = false;
            });
          } else {
            // Still dispatch clearUser even if modal not shown
            // store.dispatch(clearUser());
          }
          return Promise.reject(error);
        case 403:
          errorMessage = 'Access denied. You don\'t have permission for this action.';
          if (originalRequest.url?.includes('/mobile/fitness-plan') || originalRequest.url?.includes('/mobile/meal-plan')) {
            shouldShowModal = false;
          }
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Error ${status}: Something went wrong.`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred.';
    }

    // Show error modal
    if (shouldShowModal) {
      showErrorModal(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
