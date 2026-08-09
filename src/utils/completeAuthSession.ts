import type { AppDispatch } from '../store';
import { hydrateLoginSession } from '../slice/LoginSlice';
import { setUser } from '../slice/SignUpSlice';
import { setIsPlan, setIsQuestion, setIsWelcome } from '../slice/WelcomeSlice';
import {getProfile} from '../slice/HomeSlice';
import {
  loadAuthSession,
  mergeAuthResponseWithProfile,
  saveAuthSession,
  type PersistedAuthSession,
} from './authSession';
import type {AuthResponse, AuthResponseData} from '../types/auth';

export const completeAuthSession = async (
  dispatch: AppDispatch,
  authResponse: AuthResponse,
) => {
  const sessionData: AuthResponseData = authResponse.data ?? {};
  const homepageAccess = sessionData?.homepage_access;

  let targetIsQuestion = false;
  let targetIsPlan = false;
  let targetIsWelcome = false;

  if (homepageAccess && !homepageAccess.can_access_homepage) {
    const codes = homepageAccess.blocking_codes || [];

    if (codes.includes('missing_quiz')) {
      targetIsQuestion = true;
    } else if (codes.includes('missing_subscription')) {
      targetIsPlan = true;
    } else {
      targetIsWelcome = false;
    }
  }

  const isLoggedIn = !targetIsQuestion && !targetIsPlan && !targetIsWelcome;

  dispatch(setUser(sessionData));
  dispatch(setIsQuestion(targetIsQuestion));
  dispatch(setIsPlan(targetIsPlan));
  dispatch(setIsWelcome(targetIsWelcome));
  dispatch(hydrateLoginSession({isLoggedIn, user: authResponse}));

  await saveAuthSession({
    token: sessionData?.token ?? null,
    action_plan: sessionData?.action_plan ?? '',
    loginUser: authResponse ?? null,
    isLoggedIn,
    isWelcome: targetIsWelcome,
    isQuestion: targetIsQuestion,
    isPlan: targetIsPlan,
  });
};

export const refreshAuthenticatedSession = async (
  dispatch: AppDispatch,
  existingSession?: PersistedAuthSession | null,
) => {
  const session = existingSession ?? (await loadAuthSession());

  if (!session?.token) {
    return false;
  }

  // The request interceptor reads this slice, so restore the token before
  // asking Laravel for the account's current entitlement state.
  dispatch(
    setUser({token: session.token, action_plan: session.action_plan}),
  );

  const profileResult = await dispatch(getProfile());

  if (!getProfile.fulfilled.match(profileResult)) {
    return false;
  }

  const refreshedAuthResponse = mergeAuthResponseWithProfile(
    session.loginUser,
    profileResult.payload,
    session,
  );

  await completeAuthSession(dispatch, refreshedAuthResponse);
  return true;
};
