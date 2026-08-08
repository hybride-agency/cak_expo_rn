import type { AppDispatch } from '../store';
import { setIsLoggedIn } from '../slice/LoginSlice';
import { setUser } from '../slice/SignUpSlice';
import { setIsPlan, setIsQuestion, setIsWelcome } from '../slice/WelcomeSlice';
import { saveAuthSession } from './authSession';
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
  dispatch(setIsLoggedIn(isLoggedIn));

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
