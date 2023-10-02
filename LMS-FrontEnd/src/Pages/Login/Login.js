import classes from "./Login.module.css";
import std from "../../Assets/std.png";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../Store/auth";
import { useHistory } from "react-router";
import DescriptionAlerts from "../../Components/alertMsg/Alert";

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [unAuth, setUnAuth] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const dispatch = useDispatch();
  const history = useHistory();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    // Output sanitization check
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    // Input validation
    if (
      !sanitizedEmail.trim() ||
      !sanitizedEmail.includes("@") ||
      !sanitizedEmail.endsWith(".com")
    ) {
      setUnAuth(true);
      return;
    } else if (sanitizedPassword.length < 6) {
      setUnAuth(true);
      return;
    }
    axios
      .post(
        "http://localhost:5000/user/login",
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.auth === true) {
          dispatch(
            login({
              email: email,
              type: res.data.details.type,
              id: res.data.details._id,
              name: res.data.details.name,
              token: res.data.token,
              lmsID: res.data.details.ID,
            })
          );
          history.replace("/dashboard");
        } else {
          setUnAuth(true);
        }
      })
      .catch((er) => {
        console.log(er);
        setAlertMessage(er?.response?.data?.message);
        setSeverity("error");
        setOpenSnackbar(true);
      });
  };
  const emailhandler = (event) => {
    setUnAuth(false);
    setEmail(event.target.value);
  };
  const passwordGHandler = (event) => {
    setUnAuth(false);
    setPassword(event.target.value);
  };
  // Output Sanitizes function
  const sanitizeInput = (input) => {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  return (
    <div className={classes.login_container}>
      <DescriptionAlerts
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        severity={severity}
        alertMessage={alertMessage}
      />
      <div className={classes.login}>
        <h2 className={classes.title}>Log In</h2>
        <form onSubmit={submitHandler} className={classes.form_container}>
          <label className={classes.labels} htmlFor={"username"}>
            UserName
          </label>
          <br />
          <input
            value={email}
            onChange={emailhandler}
            type="text"
            required
            id="username"
            className={classes.inputs}
          />
          <br />
          <label className={classes.labels} htmlFor={"password"}>
            Password
          </label>
          <br />
          <input
            value={password}
            onChange={passwordGHandler}
            type="password"
            required
            id="password"
            className={classes.inputs}
          />
          <br />
          <a href={"/index/reset_password"} className={classes.forgot}>
            Forgot Password?
          </a>
          <button className={classes.btn}>LOG IN</button>
          {unAuth && <div className={classes.errorShow}>Invalid Details !</div>}
        </form>
      </div>
      <div className={classes.img_container}>
        <img className={classes.img} src={std} />
      </div>
    </div>
  );
};

export default Login;
