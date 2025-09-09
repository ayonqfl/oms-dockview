import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields if needed
}

// ✅ Define Slice state type
interface UserState {
  isLoggedIn: boolean;
  userData: User | null;
}

// ✅ Get initial state safely from localStorage
const initialState: UserState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  userData: localStorage.getItem("userData")
    ? (JSON.parse(localStorage.getItem("userData") as string) as User)
    : null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.isLoggedIn = true;
      state.userData = action.payload;
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userData = null;
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userData");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
