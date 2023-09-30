import classes from "./Announcement.module.css";
import plus from "../../Assets/plus.svg";
import List from "./List";
import { useState, useEffect } from "react";
import Loader from "../../Components/Loader/Loader";
import axios from "axios";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../Store/auth";
import DescriptionAlerts from "../../Components/alertMsg/Alert";

const Announcement = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [announcements, setAnnouncements] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [empty, setEmpty] = useState(false);
  const type = useSelector((state) => state.loging.type);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
};

  useEffect(() => {
    axios
      .get("http://localhost:5000/announcement/get_announcements",{
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.error !== true) {
          setAnnouncements(res.data);
          setLoaded(true);
          console.log(res.data);
        } else {
          setLoaded(true);
          setEmpty(true);
        }
      })
      .catch((er) => {
        if(er.message==="Network Error"){
          setAlertMessage("Your session has been expired! please login again.")
          setSeverity('info')
          setOpenSnackbar(true)
          dispatch(logout());
          history.replace("/index");
        }
      })
  }, []);
  return (
    <>
      {announcements && loaded && (
        <div className={classes.container}>
          <DescriptionAlerts openSnackbar={openSnackbar} handleCloseSnackbar={handleCloseSnackbar} severity={severity} alertMessage={alertMessage} />
          <div className={classes.Announcement_container}>
            <h2 className={classes.title}>ANNOUNCEMENTS</h2>
            <a href={"/dashboard/new_announcement"}>
              {type === "admin" && (
                <div className={classes.add_new}>
                  <img className={classes.image} src={plus} />
                  <span className={classes.prompt}>add Announcement</span>
                </div>
              )}
            </a>
            {empty && (
              <div className={classes.nodata}>No Announcements Avilable !!</div>
            )}
            {announcements.map((row) => {
              return <List data={row} />;
            })}
          </div>
          <div className={classes.side}></div>
        </div>
      )}
      {!loaded && (
        <div className={classes.loader}>
          <Loader />
        </div>
      )}
    </>
  );
};

export default Announcement;
