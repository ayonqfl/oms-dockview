// src/pages/auth/Logout.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/userSlice";
import adminServer from "../utilities/server/serverAdmin";
import { API_LOGOUT } from "../utilities/apiRequest/auth";
import errorHandler from "../utilities/errorHandler/errorHandler";
import { AppDispatch } from "../store/index"; 

const Logout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await adminServer.post(
          API_LOGOUT,
          {},
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        // ✅ Dispatch logout action
        dispatch(logout());

        // ✅ Redirect to login page
        navigate("/login");
      } catch (err) {
        errorHandler(err);
      }
    };

    doLogout();
  }, [dispatch, navigate]);

  // Optional: loading message while logging out
  return <div>Logging out...</div>;
};

export default Logout;
