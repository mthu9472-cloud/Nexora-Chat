import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import Owner from "./pages/Owner";
import "./App.css";


function App(){

  return(

    <div className="app">

      <Login />

      <hr />

      <Profile />

      <hr />

      <Post />

      <hr />

      <Feed />

      <hr />

      <Users />

      <hr />

      <Notifications />

      <hr />

      <Owner />

    </div>

  );

}


export default App;
