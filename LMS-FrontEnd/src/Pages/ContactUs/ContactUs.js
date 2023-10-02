import classes from "./ContactUs.module.css";
import pin from "../../Assets/pin.svg";
import call from "../../Assets/call.svg";
import mail from "../../Assets/mail.svg";
import world from "../../Assets/world.svg";
import { useState, useEffect } from "react";
import Loader from "../../Components/Loader/Loader";
import ErrorPopup from "../../Components/ErrorPopup/ErrorPopup";
import axios from "axios";

const ContactUs = () => {
  const [name, setname] = useState();
  const [email, setEmail] = useState();
  const [message, setMessage] = useState();
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    // Output sanitization check
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    const sanitizedMessage = sanitizeInput(message);
    // Input validation
    if (
      !sanitizedEmail.trim() ||
      !sanitizedEmail.includes("@") ||
      !sanitizedEmail.endsWith(".com")
    ) {
      setError("Required valid email!");
      return;
    } else if (!sanitizedName.trim()) {
      setError("Required valid name");
      return;
    } else if (!sanitizedMessage.trim()) {
      setError("Required valid message");
      return;
    } else if (sanitizedMessage.length < 10) {
      setError("Required more length  message");
      return;
    }

    setSubmitted(true);

    var currentdate = new Date();
    var datetime =
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    const data = {
      email,
      name,
      message,
      date: datetime,
    };

    axios
      .post(
        "http://localhost:5000/contact_us/query",
        { data },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res);
        if (res.data.created) {
          setSubmitted(false);
        } else {
          setError("Unable to submit! retry again");
          setSubmitted(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setError("Unable to submit! retry again");
        setSubmitted(false);
      });
  };
  const namehandler = (event) => {
    setname(event.target.value);
  };
  const emailHandler = (event) => {
    setEmail(event.target.value);
  };
  const messageHandler = (event) => {
    setMessage(event.target.value);
  };
  const clickedHandler = () => {
    setError(null);
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
    <>
      {submitted && (
        <div className={classes.loader}>
          <div className={classes.loader_in}>
            <Loader />
          </div>
        </div>
      )}
      <div className={classes.conatiner}>
        {error && <ErrorPopup clickedHandler={clickedHandler} error={error} />}

        <div className={classes.side}>
          <h2 className={classes.title}>Get In Touch</h2>
          <div className={classes.row}>
            <img className={classes.image} src={pin} />
            <div className={classes.details}>location details</div>
          </div>
          <div className={classes.row}>
            <img className={classes.image} src={call} />
            <div className={classes.details}>(+94) 77 8862 172</div>
          </div>
          <div className={classes.row}>
            <img className={classes.image} src={mail} />
            <div className={classes.details}>example@gamil.com</div>
          </div>
          <div className={classes.row}>
            <img className={classes.image} src={world} />
            <div className={classes.details}>lms.lk</div>
          </div>
        </div>
        <div className={classes.form_Container}>
          <form onSubmit={submit}>
            <label className={classes.labels}>Name</label>
            <input
              // required
              value={name}
              onChange={namehandler}
              type="text"
              className={classes.inputs}
              placeHolder="Your Name"
            />
            <label className={classes.labels}>Email</label>
            <input
              // required
              value={email}
              onChange={emailHandler}
              type="mail"
              className={classes.inputs}
              placeHolder="Your Mail"
            />
            <label className={classes.labels}>Message</label>
            <textarea
              // required
              value={message}
              onChange={messageHandler}
              type="text"
              className={classes.inputsText}
              placeHolder="Your Message"
            />
            <button className={classes.submit}>SUBMIT</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
