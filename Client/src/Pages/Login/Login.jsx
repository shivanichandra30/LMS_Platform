import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin, studentLogin, tutorLogin } from "../../Redux/auth/action";

// CSS imports
import { message, Space, Spin } from "antd";
import "./Login.css";
import axios from "axios"; // Import axios for API calls

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((store) => store.auth);

  // Alert API
  const [messageApi, contextHolder] = message.useMessage();

  // Loading state
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "",
    email: "",
    password: "",
    confirmPassword: "", // for registration
  });

  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and register

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to send registration data to the backend
  const handleRegistration = async () => {
    try {
      setLoading(true);
      // Send registration request to the backend
      const response = await axios.post(
        "http://localhost:4500/student/register",
        {
          /* username: formData.email, // Assuming email as username */
          email: formData.email,
          password: formData.password,
        }
      );

      setLoading(false);
      messageApi.open({
        type: "success",
        content: "Registration successful!",
        duration: 3,
      });
      setIsLogin(true); // Switch back to login after successful registration
    } catch (error) {
      setLoading(false);
      messageApi.open({
        type: "error",
        content:
          error.response?.data?.msg || "Registration failed! Please try again.",
        duration: 3,
      });
    }
  };

  // Function to handle login form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (formData.type === "") {
      return messageApi.open({
        type: "error",
        content: "Please select user type.",
        duration: 3,
      });
    }

    setLoading(true);

    if (isLogin) {
      // Handle login logic
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      if (formData.type === "admin") {
        dispatch(adminLogin(loginData)).then((res) => handleResponse(res));
      } else if (formData.type === "tutor") {
        dispatch(tutorLogin(loginData)).then((res) => handleResponse(res));
      } else if (formData.type === "student") {
        dispatch(studentLogin(loginData)).then((res) => handleResponse(res));
      }
    } else {
      // Handle registration
      if (formData.password !== formData.confirmPassword) {
        setLoading(false);
        messageApi.open({
          type: "error",
          content: "Passwords do not match!",
          duration: 3,
        });
      } else {
        handleRegistration(); // Call the registration API
      }
    }
  };

  // Helper function to handle API response (login or registration)
  const handleResponse = (res) => {
    if (res.message === "Wrong credentials") {
      setLoading(false);
      messageApi.open({
        type: "info",
        content: "Wrong credentials!",
        duration: 3,
      });
    } else if (res.message === "Access Denied") {
      setLoading(false);
      messageApi.open({
        type: "info",
        content: "Your access has been revoked by the admin!",
        duration: 3,
      });
    } else if (res.message === "Error") {
      setLoading(false);
      messageApi.open({
        type: "info",
        content: "Something went wrong, please try again.",
        duration: 3,
      });
    } else {
      setLoading(false);
      navigate("/home");
    }
  };

  if (auth.data.isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="login">
      <div>
        <p>Please use these credentials.</p>
        <p>Email: test@gmail.com</p>
        <p>Password: test</p>
      </div>
      <br />
      <div className="loginContainer">
        <div className="loginImage">
          <img
            src="https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7863.jpg"
            alt=""
          />
        </div>
        <div className="loginDetail">
          <div>
            <h3>{isLogin ? "Login" : "Register"}</h3>
          </div>

          <div>
            {/* Toggle form based on isLogin state */}
            <form onSubmit={handleFormSubmit}>
              <select name="type" onChange={handleFormChange} required>
                <option value="">Select user type</option>
                <option value="tutor">Tutor</option>
                <option value="student">Student</option>
              </select>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                type="email"
                placeholder="Enter email"
              />
              <input
                required
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                type="password"
                placeholder="Enter password"
              />
              {!isLogin && (
                <input
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  type="password"
                  placeholder="Confirm password"
                />
              )}
              <button type="submit">{isLogin ? "CONTINUE" : "REGISTER"}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create an Account" : "Already have an Account?"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {contextHolder}
      {loading ? (
        <Space
          style={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.2)",
            top: "0",
            left: "0",
            display: "flex",
            justifyContent: "center",
            alignItem: "center",
          }}
        >
          <Spin size="large" />
        </Space>
      ) : null}
    </div>
  );
};

export default Login;
