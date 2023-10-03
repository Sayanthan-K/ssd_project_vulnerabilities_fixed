import "./App.css";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import ModulePage from "./Pages/ModulePage/ModulePage";
import Services from "./Pages/Services/Services";

import ModulePageInsights from "./Pages/ModulePageReport/ModulePageInsights";
import SelectMaterial from "./Pages/SelectMaterials/SelectMaterial";
import AddLink from "./Pages/AddLectuerMaterial/AddLink/AddLink";
import AddAttandance from "./Pages/AddLectuerMaterial/AddAttandance/AddAttandance";
import AddFile from "./Pages/AddLectuerMaterial/AddFile/AddFile";
import AddNotes from "./Pages/AddLectuerMaterial/AddNotes/AddNotes";
import AddSubmission from "./Pages/AddLectuerMaterial/AddSubmission/AddSubmission";

import Submit from "./Pages/Submit/Submit";
import Login from "./Pages/Login/Login";
import store from "./Store";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import AddUser from "./Pages/UserManagement/AddUser/AddUser";
import UserReport from "./Pages/UserManagement/UserReport/UserReport";
import EditUser from "./Pages/UserManagement/EditUser/EditUser";
import AddRole from "./Pages/UserManagement/AddRole/NewRole";
import FacultiesView from "./Pages/FacultiesPage/FacultiesView/FacultiesView";
import ModuleEnrollmentReport from "./Pages/ModulePageView/ModuleEnrollmentReport/ModuleEnrollmentReport";
import AddFaculties from "./Pages/FacultiesPage/AddFaculties/AddFaculties";
import Addcourse from "./Pages/CoursePage/Addcourse/Addcourse";
import CoursePage from "./Pages/CoursePage/CoursePage";
import ModulepageView from "./Pages/ModulePageView/ModulepageView/ModulepageView";
import AddModule from "./Pages/ModulePageView/ModulepageView/AddModule/AddModule";
import ModuleEnrollment from "./Pages/ModulePageView/ModuleEnrollmentPage/ModuleEnrollmentPage";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";

import EventSummary from "./Pages/EventSummary/EventSummary";
import NewEvent from "./Pages/NewEvent/NewEvent";

import Announcement from "./Pages/Announcement/Announcement";
import NewAnnouncement from "./Pages/NewAnnouncement/NewAnnouncement";
import View from "./Pages/AnnouncementFullView/View";
import EnrolledCourses from "./Pages/EnrolledCourses/EnrolledCourses";
import NewPassword from "./Pages/NewPassword/NewPassword";
import page404 from "./Pages/404/404";
import ContactUs from "./Pages/ContactUs/ContactUs";

import StudenList from "./Pages/Studentportal/StudentList/StudentList";
import UpdateGPA from "./Pages/Studentportal/AdminUpdateGPA/UpdateGPA";
import StudentPortal from "./Pages/Studentportal/StudentView/StudentPortal";

import ForumView from "./Pages/ForumManagement/ForumView/ForumView";
import WeekForumView from "./Pages/ForumManagement/WeekForumView/WeekForumView";
import AddForum from "./Pages/ForumManagement/AddForum/AddForum";

import { Route, Switch } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Redirect } from "react-router";
import { useSelector } from "react-redux";

function App() {
  const isLogedIn = useSelector((state) => state.loging.isLogedIn);
  const type = useSelector((state) => state.loging.type);

  return (
    <Provider store={store}>
      <Router>
        <Header />
        {isLogedIn ? (
          <Switch>
            <Route path="/my-courses/submission/:ID" exact component={Submit} />

            <Route
              path="/my-courses/insight/:moduleID"
              exact
              component={ModulePageInsights}
            />

            <Route
              path="/my-courses/add_attandance/:weekID"
              exact
              component={AddAttandance}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/add_submission/:weekID"
              exact
              component={AddSubmission}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/add_notes/:weekID"
              exact
              component={AddNotes}
            />
            <Route
              path="/my-courses/add_file/:weekID"
              exact
              component={AddFile}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/add_link/:weekID"
              exact
              component={AddLink}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>

            <Route
              path="/my-courses/edit_submission/:MaterialID"
              exact
              component={AddSubmission}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/edit_notes/:MaterialID"
              exact
              component={AddNotes}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/edit_file/:MaterialID"
              exact
              component={AddFile}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/my-courses/edit_link/:MaterialID"
              exact
              component={AddLink}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>

            <Route
              path="/my-courses/select_type/:weekID"
              exact
              component={SelectMaterial}
            />
            <Route path="/my-courses/" exact component={EnrolledCourses} />
            <Route path="/my-courses/:moduleID" exact component={ModulePage} />

            <Route path="/services" exact component={Services} />

            <Route
              path="/services/student_portal"
              exact
              component={StudenList}
            />
            <Route
              path="/services/student_portal/:SID"
              exact
              component={UpdateGPA}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/services/student_portal/view/:SID"
              exact
              component={StudentPortal}
            />

            <Route path="/add-user" exact component={AddUser}>
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route path="/user-report" exact component={UserReport}>
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route path="/edit-user/:editID" exact component={EditUser}>
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route path="/add-role" exact component={AddRole}>
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>

            <Route path="/faculties" exact component={FacultiesView} />
            <Route
              path="/faculties/module/insight/:moduleId"
              exact
              component={ModuleEnrollmentReport}
            />
            <Route
              path="/faculties/Addfaculties"
              exact
              component={AddFaculties}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/editfaculties/:facultyId"
              exact
              component={AddFaculties}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/Addcourse/:facultyID"
              exact
              component={Addcourse}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/editcourse/:courseid"
              exact
              component={Addcourse}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/course/Year/:courseID"
              exact
              component={CoursePage}
            />
            <Route
              path="/faculties/course/:Year/:semester/:ModuleID"
              exact
              component={ModulepageView}
            />
            <Route
              path="/faculties/course/Addmodule/:Year/:semester/:moduleid"
              exact
              component={AddModule}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/module/:moduleid1"
              exact
              component={AddModule}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/faculties/enroll/:moduleID"
              exact
              component={ModuleEnrollment}
            />

            <Route path="/my-profile" exact component={ProfilePage} />
            <Route path="/calendar/:date" exact component={EventSummary} />
            <Route path="/new_calendar" exact component={NewEvent} />

            <Route path="/" exact>
              <Redirect to="/dashboard" />
            </Route>
            <Route path="/dashboard" exact component={Announcement} />
            <Route
              path="/dashboard/announcement/:annID"
              exact
              component={View}
            />
            <Route
              path="/dashboard/new_announcement"
              exact
              component={NewAnnouncement}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>

            <Route
              path="/dashboard/edit_announcement/:annID"
              exact
              component={NewAnnouncement}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>

            <Route path="/index" exact component={Login}>
              {isLogedIn && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/index/reset_password"
              exact
              component={ResetPassword}
            />
            <Route path="/contact-us" exact component={ContactUs} />
            <Route path="/feedback" exact component={ContactUs} />

            <Route
              path="/my-courses/add-forum/:week"
              exact
              component={AddForum}
            >
              {type !== "admin" && <Redirect to="/dashboard" />}
            </Route>
            <Route
              path="/forum/:moduleID/:weekID/:forumID"
              exact
              component={ForumView}
            />

            <Route path="/weekforum" exact component={WeekForumView} />

            <Route path="*" component={page404} />
          </Switch>
        ) : (
          <Switch>
            <Route path="/index" exact component={Login}></Route>
            <Route path="/contact-us" exact component={ContactUs} />
            <Route path="/feedback" exact component={ContactUs} />
            <Route
              path="/index/reset_password"
              exact
              component={ResetPassword}
            />
            <Route
              path="/index/new_password/:userID"
              exact
              component={NewPassword}
            />
            <Route path="*">
              <Redirect to="/index" />
            </Route>
          </Switch>
        )}

        <Footer />
      </Router>
    </Provider>
  );
}

export default App;
