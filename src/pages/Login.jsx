import { useState } from "react";
import { auth, db } from "../firebase/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc
} from "firebase/firestore";


function Login(){

  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");


  async function register(){

    try{

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


      await setDoc(
        doc(db,"users",result.user.uid),
        {
          username: username,
          email: email,
          uid: result.user.uid,
          followers: 0,
          following: 0,
          followersList: [],
          followingList: [],
          created: new Date().toISOString()
        }
      );


      alert("Register Success");


    }catch(error){

      alert(error.message);

    }

  }



  async function login(){

    try{

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Success");


    }catch(error){

      alert(error.message);

    }

  }



  return(

    <div>

      <h1>Nexora Login 👤</h1>


      <input
        placeholder="Username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
      />

      <br/>


      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/>


      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/>


      <button onClick={register}>
        Register
      </button>


      <button onClick={login}>
        Login
      </button>


    </div>

  );

}


export default Login;
