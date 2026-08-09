import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import loginReducer from "../slice/LoginSlice";
import welcomeReducer from "../slice/WelcomeSlice";
import questionReducer from "../slice/QuestionSlice";
import signUpReducer from "../slice/SignUpSlice";
import planReducer from "../slice/PlanSlice";
import homeReducer from "../slice/HomeSlice";
import subscriptionHistoryReducer from "../slice/SubscriptionHistorySlice";
import paymentReducer from "../slice/PaymentSlice";

export const store = configureStore({
    reducer: {
        login: loginReducer,
        welcome: welcomeReducer,
        question: questionReducer,
        signUp: signUpReducer,
        plan: planReducer,
        home: homeReducer,
        subscriptionHistory: subscriptionHistoryReducer,
        payment: paymentReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
