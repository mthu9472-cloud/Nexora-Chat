import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

import { auth } from "../firebase/firebase";


function Navbar() {

  const navigate = useNavigate();


  async function logout(){

  if(auth.currentUser){

    await updateDoc(
      doc(db,"users",auth.currentUser.uid),
      {
        online:false,
        lastSeen:serverTimestamp()
      }
    );

  }

  await signOut(auth);

  navigate("/");

}


  return (

    <nav>

      <Link to="/feed">🏠 Home</Link>{" "}

      <Link to="/feed">📝 Feed</Link>{" "}

      <Link to="/post">➕ Post</Link>{" "}

      <Link to="/users">👥 Users</Link>{" "}

      <Link to="/chat">💬 Chat</Link>{" "}

      <Link to="/profile">👤 Profile</Link>{" "}

      <button onClick={logout}>
        🚪 Logout
      </button>


    </nav>

  );

}


export default Navbar;
