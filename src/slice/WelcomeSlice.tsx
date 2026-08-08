import { createSlice } from "@reduxjs/toolkit";

const welcomeSlice = createSlice({
    name: 'welcome',
    initialState: {
        isWelcome: false,
        isQuestion: false,
        isPlan: false,
    },
    reducers: {
        setIsWelcome: (state, action) => {
            state.isWelcome = action.payload;
        },
        setIsQuestion: (state, action) => {
            state.isQuestion = action.payload;
        },
        setIsPlan: (state, action) => {
            state.isPlan = action.payload;
        },

    }
})

export const { setIsWelcome, setIsQuestion, setIsPlan } = welcomeSlice.actions;
export default welcomeSlice.reducer;