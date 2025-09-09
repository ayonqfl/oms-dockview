import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../slices/userSlice";
import { RootState, AppDispatch } from "../store/index";
import adminServer, { setCookiesFromAuthResponse } from "../utilities/server/serverAdmin";
import errorHandler from "../utilities/errorHandler/errorHandler";
import { API_LOGIN } from "../utilities/apiRequest/auth";
import logo from "../assets/broker-logo-light.png";

// Type for credentials
interface Credentials {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  const [credentials, setCredential] = useState<Credentials>({
    username: "",
    password: "",
  });

  const [isLoading, setLoading] = useState(false);

  // Input handler
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredential((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formdata = new URLSearchParams();
    formdata.append("username", credentials.username);
    formdata.append("password", credentials.password);
    formdata.append("user_device", "Desktop");

    try {
      const res = await adminServer.post(API_LOGIN, formdata, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setCookiesFromAuthResponse(res.data);
      dispatch(login(res.data));
      navigate("/trade");
    } catch (err) {
      errorHandler(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="login_page_container d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundImage: `url('https://images.hdqwalls.com/wallpapers/stock-chart-minimal-4k-8c.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="card shadow-lg border-0"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                borderRadius: "1.5rem",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="logo"
                    className="mb-3"
                    style={{ width: "200px", height: "50px" }}
                  />
                  <h3 className="text-white fw-bold mb-2">Welcome Back!</h3>
                  <p className="text-white-50 mb-4">Please login to continue</p>
                </div>

                <form onSubmit={onSubmit}>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={credentials.username}
                      onChange={handleChange}
                      name="username"
                      className="form-control form-control-lg bg-dark text-white border-0"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.75rem",
                      }}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="form-control form-control-lg bg-dark text-white border-0"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.75rem",
                      }}
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                      />
                      <label
                        className="form-check-label text-white-50"
                        htmlFor="rememberMe"
                      >
                        Remember Me
                      </label>
                    </div>
                    <a href="#!" className="text-primary text-decoration-none">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={isLoading}
                    style={{
                      borderRadius: "0.75rem",
                      background: "linear-gradient(90deg, #0d6efd, #6610f2)",
                      border: "none",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Trying...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;