import classes from "./NewAnnouncement.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import ErrorPopup from "../../Components/ErrorPopup/ErrorPopup";
import DeletePopup from "../../Components/DeletePopup/DeletePopup";

const NewAnnouncement = (props) => {
  const annID = props.match.params.annID;
  const history = useHistory();

  const [subject, setSubject] = useState();
  const [message, setMEssage] = useState();
  const [file, setFile] = useState();
  const [btn, setBtn] = useState("SAVE");
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState(null);
  const [link, setLink] = useState();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (annID) {
      setEdit(true);
      console.log("aaa");
      axios
        .get(
          "http://localhost:5000/announcement/get_announcement?ID=" + annID,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          if (res.data.error !== true) {
            setSubject(res.data.subject);
            setMEssage(res.data.message);
            setLink(res.data.link);
          } else {
            console.log(res.data);
          }
        })
        .catch((er) => {
          console.log(er);
        });
    }
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    const data = new FormData();
    // Output sanitization check
    const sanitizedsubject = sanitizeInput(subject);
    const sanitizedmessage = sanitizeInput(message);

    var currentdate = new Date();
    var date =
      currentdate.getDate() +
      "-" +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getFullYear();

    var time =
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();
    // Input validation
    if (!subject.trim()) {
      setError("Invalid Subject");
      return;
    } else if (!message.trim() || message.length < 20) {
      setError("Message should be more length");
      return;
    } else if (!edit && !file) {
      setError("Seleact a valid file to upload");
      return;
    }

    data.append("details", file);
    data.append("_id", annID ? annID : undefined);
    data.append("edit", edit);
    data.append("subject", sanitizedsubject);
    data.append("message", sanitizedmessage);
    data.append("date", date);
    data.append("time", time);
    data.append("author", "News Admin");

    setBtn("SAVING...");
    axios
      .post("http://localhost:5000/announcement/add_announcement", data, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        setBtn("SAVE");
        history.replace("/dashboard");
      })
      .catch((er) => {
        console.log(er);
      });
  };
  const subjectHandler = (event) => {
    setSubject(event.target.value);
  };
  const messageHandler = (event) => {
    setMEssage(event.target.value);
  };
  const selectedFileHandler = (event) => {
    setFile(event.target.files[0]);
  };
  const clickedHandler = () => {
    setError(null);
  };
  const deleteHandler = () => {
    setClicked(true);
  };
  const hide = () => {
    setClicked(false);
  };
  const onDelete = () => {
    axios
      .delete(
        "http://localhost:5000/announcement/delete_announcement?ID=" + annID,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setClicked(false);
        history.replace("/dashboard");
      })
      .catch((er) => {
        setClicked(false);
        console.log(er);
      });
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
    <div className={classes.container}>
      {error && <ErrorPopup clickedHandler={clickedHandler} error={error} />}
      {clicked && <DeletePopup hide={hide} onDelete={onDelete} />}
      <form
        enctype="multipart/form-data"
        onSubmit={submitHandler}
        className={classes.form_container}
      >
        <label className={classes.labels} htmlFor="subject">
          Subject
        </label>
        <br />
        <input
          id="subject"
          required
          type="text"
          name="subject"
          value={subject}
          className={classes.inputs}
          onChange={subjectHandler}
        />
        <label className={classes.labels} htmlFor="message">
          Message
        </label>
        <br />
        <textarea
          id="message"
          required
          type="text"
          name="subject"
          value={message}
          className={classes.textArea}
          onChange={messageHandler}
        />
        <label className={classes.labels} htmlFor="file">
          {edit ? "File(optional)" : "File"}
        </label>
        <br />
        {edit ? (
          <input
            id="file"
            type="file"
            name="subject"
            className={classes.inputs}
            onChange={selectedFileHandler}
          />
        ) : (
          <input
            required
            id="file"
            type="file"
            name="subject"
            className={classes.inputs}
            onChange={selectedFileHandler}
          />
        )}
        {edit && (
          <a className={classes.linkto} href={link}>
            view current file
          </a>
        )}
        <button className={classes.save}>{btn}</button>
      </form>
      {edit && (
        <div onClick={deleteHandler} className={classes.deletebtn}>
          Delete
        </div>
      )}
    </div>
  );
};

export default NewAnnouncement;
