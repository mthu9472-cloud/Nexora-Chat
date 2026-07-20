import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Owner(){

  const [users,setUsers] = useState([]);
  const [allowed,setAllowed] = useState(false);

  const OWNER_UID = "v6iXPqaTdOMZWodwADoIWwY6apn2";


  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(auth,(user)=>{

      if(user && user.uid === OWNER_UID){
        setAllowed(true);
      }else{
        setAllowed(false);
      }

    });

    return ()=>unsubscribe();

  },[]);



  async function loadUsers(){

    const snap = await getDocs(collection(db,"users"));

    let data=[];

    snap.forEach((doc)=>{

      data.push({
        id:doc.id,
        ...doc.data()
      });

    });

    setUsers(data);

  }



  useEffect(()=>{

    if(allowed){
      loadUsers();
    }

  },[allowed]);



  async function changeRole(id,role){

    await updateDoc(doc(db,"users",id),{
      role: role
    });

    alert("Role Updated");

    loadUsers();

  }



  async function deleteUser(id){

    let ok = confirm("Delete this user?");

    if(ok){

      await deleteDoc(doc(db,"users",id));

      alert("User Deleted");

      loadUsers();

    }

  }



  if(!allowed){

    return(
      <div>
        <h1>🔒 Owner Only</h1>
        <p>You don't have permission</p>
      </div>
    );

  }



  return(

    <div>

      <h1>Nexora Owner Panel 👑</h1>

      <h2>Users List 👥</h2>


      {
        users.map((user)=>(

          <div key={user.id}>

            👤 {user.username}
            <br/>

            📧 {user.email}
            <br/>

            Role: {user.role}

            <br/><br/>


            <button
            onClick={()=>changeRole(user.id,"admin")}
            >
              Make Admin
            </button>


            <button
            onClick={()=>deleteUser(user.id)}
            >
              Delete
            </button>


            <hr/>

          </div>

        ))
      }


    </div>

  );

}


export default Owner;
