import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


function Notifications(){

  const [user,setUser] = useState(null);
  const [notifications,setNotifications] = useState([]);


  async function loadNotifications(uid){

    const q = query(
      collection(db,"notifications"),
      where("ownerUid","==",uid)
    );


    const snap = await getDocs(q);


    let data=[];


    snap.forEach((item)=>{

      data.push({
        id:item.id,
        ...item.data()
      });

    });


    setNotifications(data);

  }



  useEffect(()=>{

    const unsubscribe =
    onAuthStateChanged(auth,(currentUser)=>{

      setUser(currentUser);


      if(currentUser){

        loadNotifications(currentUser.uid);

      }

    });


    return ()=>unsubscribe();


  },[]);



  return(

    <div>

      <h1>Nexora Notifications 🔔</h1>


      {
        notifications.length === 0 ?

        <p>No Notifications</p>

        :

        notifications.map((n)=>(

          <div key={n.id}>

            🔔 {n.text}

            <br/>

            👤 {n.from}

            <br/>

            🕒 {n.time}

            <hr/>

          </div>

        ))

      }


    </div>

  );

}


export default Notifications;
