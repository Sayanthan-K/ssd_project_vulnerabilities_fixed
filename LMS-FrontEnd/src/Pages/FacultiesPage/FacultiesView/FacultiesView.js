import Facultie from "./Components/Faculties";
import classes from "./FacultiesView.module.css";
// import plus from "../../../Assets/plus.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import plus from "../../../Assets/plusFaculty.png"
import Loader from "../../../Components/Loader/Loader";
import Faculties from "./Components/Faculties";
import { useHistory } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../Store/auth";
import DescriptionAlerts from "../../../Components/alertMsg/Alert";


const FacultiesView = (props) => {
  const history = useHistory();
  const [facultys, setfacultys] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const userType = useSelector((state) => state.loging.type);
  const token = useSelector((state) => state.loging.token);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const dispatch = useDispatch();


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
};

  useEffect(() => {
    axios
      .get("http://localhost:5000/Faculty/get_faculties",{
          withCredentials: true,
        })
      .then((res) => {
        if (res.data.auth === false) {
          setTimeout(() => {
            dispatch(logout());
          }, 300);
        }else {
          setfacultys(res.data);
          setLoaded(true);
        }
      })
      .catch((er) => {
        if(er.message==="Network Error"){
          setAlertMessage("Your session has been expired! please login again.")
          setSeverity('info')
          setOpenSnackbar(true)
          dispatch(logout());
          setTimeout(() => {history.replace("/index");}, 5000);
        }
      });
  }, []);
  return (<>
    <div className={classes.main}>
    <DescriptionAlerts openSnackbar={openSnackbar} handleCloseSnackbar={handleCloseSnackbar} severity={severity} alertMessage={alertMessage} />
      {/* <FacultieName FacultiesName="Computing"/>
        <FacultieName FacultiesName="Computing"/>
        <FacultieName FacultiesName="Computing"/>
        <FacultieName FacultiesName="Computing"/> */}

      {loaded &&
        facultys.map((row) => {
          return <Faculties FacultiesName={row.name} data={row} />;
          
        })}
  {userType === "admin" && ( 
      <div className={classes.main_space1}>
        <div className={classes.main_space}>
          <a className={classes.addFaculites} href="/faculties/Addfaculties">
            <img src={plus} className={classes.plusIcon} />
          </a>
        </div>
      </div>)}
      {!loaded && (
        <div className={classes.loader}>
          <Loader/>
        </div>
      )}
    </div>
    
    
    </>
  );
};
export default FacultiesView;
