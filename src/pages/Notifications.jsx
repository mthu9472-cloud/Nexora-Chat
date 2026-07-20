import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


function Notifications(){

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




  async function markRead(id){

    await updateDoc(
      doc(db,"notifications",id),
      {
        read:true
      }
    );

  }




  useEffect(()=>{


    const unsubscribe =
    onAuthStateChanged(auth,(currentUser)=>{


      if(currentUser){

        loadNotifications(currentUser.uid);

      }


    });


    return ()=>unsubscribe();


  },[]);





  async function openPost(n){


    if(!n.read){

      await markRead(n.id);

    }


    if(n.postId){

      window.location.hash =
      "post-" + n.postId;


    }


  }





  return(

    <div>


      <h1>
        Nexora Notifications 🔔
      </h1>



      {

        notifications.length === 0 ?

        <p>No Notifications</p>


        :


        notifications.map((n)=>(


          <div

            key={n.id}

            onClick={()=>openPost(n)}

            style={{

              cursor:"pointer",

              fontWeight:n.read ? "normal" : "bold"

            }}

          >


            {
              n.read ?

              "🔔"

              :

              "🔴🔔"

            }


            {" "}

            {n.text}


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
