import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "./firebase/firebase";

import {
   doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Post from "./pages/Post";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import Owner from "./pages/Owner";
import Chat from "./pages/Chat";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
 
       

    if(currentUser){
      await updateDoc(doc(db,"users",currentUser.uid),{
        online:true,
        lastSeen:serverTimestamp()
      });
    }
    

  });

  const handleVisibility = async () => {

  if(auth.currentUser){

    await updateDoc(
      doc(db,"users",auth.currentUser.uid),
      {
        online: document.visibilityState === "visible",
        lastSeen: serverTimestamp()
      }
    );

  }

};

document.addEventListener(
  "visibilitychange",
  handleVisibility
);

return () => {
  unsubscribe();

  document.removeEventListener(
    "visibilitychange",
    handleVisibility
  );
};

}, []);


  return (
    <div>
      <h1>Nexora 🚀</h1>

      {user && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute user={user}>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post"
          element={
            <ProtectedRoute user={user}>
              <Post />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute user={user}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute user={user}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <ProtectedRoute user={user}>
              <Owner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <Chat />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
}

export default App;
