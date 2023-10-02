import classes from "./AddFaculties.module.css";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import ErrorPopup from "../../../Components/ErrorPopup/ErrorPopup";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logout } from "../../../Store/auth";
import Success from "../../../Components/SuccessPopup/Success";

const AddFaculties = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const id = props.match.params.facultyId;
  const [edit, setEdit] = useState(false);
  const [btn, setBtn] = useState("ADD");
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(false);
  const token = useSelector((state) => state.loging.token);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [facultyid, setFacultyId] = useState("");
  const [Incharge, setIncharge] = useState("");

  useEffect(() => {
    if (!id) {
      //setEdit(false);
    } else {
      // setEdit(true);
      setBtn("SAVE");
      axios
        .get("http://localhost:5000/Faculty/getfaculty?id=" + id, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.auth === false) {
            setError("You Are not Authorized to get faculty !");
            // setIsUploaded(false);
            setTimeout(() => {
              dispatch(logout());
            }, 1000);
          } else if (res.data.fetch === false) {
            setError("No matching Job found ! redirecting to portal");
            //setIsUploaded(false);
            history.replace("/faculties");
          } else {
            setName(res.data.name);
            setFacultyId(res.data.id);
            setIncharge(res.data.Incharge);
          }
        })
        .catch((er) => {
          console.log("error");
        });
    }
  }, []);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    // Output sanitization check
    const sanitizedName = sanitizeInput(name);
    const sanitizedIncharge = sanitizeInput(Incharge);
    const sanitizedFacultyId = sanitizeInput(facultyid);
    // Input Validation
    if (!sanitizedName.trim()) {
      setError("Required valid faculty name!!");
      return;
    } else if (!sanitizedIncharge.trim()) {
      setError("Required valid faculty Incharge!!!");
      return;
    } else if (!sanitizedFacultyId.trim()) {
      setError("Required valid faculty id!!!");
      return;
    } else if (sanitizedFacultyId.trim().length !== 8) {
      setError("Required valid and 8-digit Faculty ID");
      return;
    }

    const Facultydata = {
      _id: id ? id : null,
      id: sanitizedFacultyId,
      name: sanitizedName,
      Incharge: sanitizedIncharge,
      courses: [],
    };

    if (!id) {
      setBtn("ADDING...");
      try {
        const response = await axios.post(
          "http://localhost:5000/Faculty/addFaculty",
          Facultydata,
          {
            withCredentials: true,
          }
        );
        handleResponse(response);
      } catch (error) {
        console.error(error);
      }
    } else {
      setBtn("SAVE..");
      try {
        const response = await axios.put(
          "http://localhost:5000/Faculty/UpdateFaculty",
          Facultydata,
          {
            withCredentials: true,
          }
        );
        handleResponse(response);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleResponse = (response) => {
    if (response.data.auth === false) {
      setError("You Are not Authorized!");
      setTimeout(() => {
        dispatch(logout());
      }, 1600);
    } else if (response.data.uploaded === true) {
      setSuccess(true);
      setTimeout(() => {
        history.replace("/faculties");
      }, 2200);
    } else {
      setError("Unable to update. Please make changes!");
    }
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

  const clickedHandler = () => {
    setError(null);
  };

  const onRedirect = () => {
    window.location.reload();
  };

  return (
    <div className={classes.squareview}>
      {error && <ErrorPopup clickedHandler={clickedHandler} error={error} />}
      {success && <Success redirect={onRedirect} />}
      {id && <h2 className={classes.title}>Edit Faculties</h2>}
      {!id && <h2 className={classes.title}>ADD Faculties</h2>}

      <hr className={classes.line}></hr>
      <form className={classes.formContainer} onSubmit={onSubmitHandler}>
        <label htmlFor="FacultieName" className={classes.labels}>
          Faculty Name :
        </label>
        <br />
        <input
          type="text"
          id="FacultieName"
          name="FacultieName"
          className={classes.inputs}
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        <label htmlFor="FacultieID" className={classes.labels}>
          Faculty ID :
        </label>
        <br />
        <input
          type="text"
          id="FacultieID"
          name="FacultieID"
          className={classes.inputs}
          onChange={(e) => setFacultyId(e.target.value)}
          value={facultyid}
        />

        <label htmlFor="FacultieIncharge" className={classes.labels}>
          Faculty Incharge :
        </label>
        <br />
        <select
          id="faculty"
          name="faculty"
          className={classes.inputs1}
          value={Incharge}
          onChange={(e) => setIncharge(e.target.value)}
        >
          <option value="" hidden></option>
          <option value="DR.Kamal">DR.Kamal</option>
          <option value="pro.Nirupa">Prof.Nirupa</option>
          <option value="DR.Kumara">DR.Kumara</option>
          <option value="DR.Kumara">Prof.Nimal</option>
        </select>

        <button className={classes.save}>{btn}</button>
      </form>
    </div>
  );
};

export default AddFaculties;
