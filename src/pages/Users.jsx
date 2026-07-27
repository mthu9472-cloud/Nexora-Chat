import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc
} from "firebase/firestore";


function Users(){

  const navigate = useNavigate();


  const [users,setUsers] = useState([]);
  const [search,setSearch] = useState("");
  const [currentUser,setCurrentUser] = useState(null);



  useEffect(()=>{


    loadUsers();


    const unsub = onAuthStateChanged(auth,()=>{

      loadCurrentUser();

    });


    return ()=>unsub();


  },[]);



  async function loadCurrentUser(){


    const user = auth.currentUser;


    if(!user) return;



    const snap = await getDoc(
      doc(db,"users",user.uid)
    );


    if(snap.exists()){


      const data = snap.data();


      setCurrentUser({

        uid:user.uid,

        ...data,

        followingList:
        data.followingList || [],

        followersList:
        data.followersList || []

      });


    }


  }



  function loadUsers(){


    onSnapshot(
  collection(db,"users"),
  (snap)=>{

    let data=[];


    snap.forEach((item)=>{

      const u = item.data();


      data.push({

        uid:item.id,

        ...u,

        followers:
        u.followers || 0,

        following:
        u.following || 0,

        followingList:
        u.followingList || []

      });


    });


    setUsers(data);

  });
}

async function followUser(target){


  const user = auth.currentUser;


  if(!user){

    alert("Login First");

    return;

  }



  const myRef = doc(
    db,
    "users",
    user.uid
  );


  const targetRef = doc(
    db,
    "users",
    target.uid
  );



  const followingList =
  currentUser?.followingList || [];



  const already =
  followingList.includes(target.uid);



  if(already){


    await updateDoc(myRef,{

      followingList:
      arrayRemove(target.uid),

      following:
      Math.max((currentUser.following || 1)-1,0)

    });



    await updateDoc(targetRef,{

      followersList:
      arrayRemove(user.uid),

      followers:
      Math.max((target.followers || 1)-1,0)

    });



  }else{


    await updateDoc(myRef,{

      followingList:
      arrayUnion(target.uid),

      following:
      (currentUser.following || 0)+1

    });



    await updateDoc(targetRef,{

      followersList:
      arrayUnion(user.uid),

      followers:
      (target.followers || 0)+1

    });



    await addDoc(
      collection(db,"notifications"),
      {

        ownerUid: target.uid,

        text:
        "👥 "+user.email+" started following you",

        from:user.email,

        time:new Date().toISOString()

      }
    );


  }



  await loadCurrentUser();

  await loadUsers();


}
return(

  <div className="users-page">


    <h1>Nexora Users 👥</h1>
    <input
    placeholder="🔎 Search user..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
  />


    {
  users.filter((user)=>
    user.username?.toLowerCase().includes(search.toLowerCase())
  ).map((user)=>(


        <div key={user.uid} className="user-card">


          <h3>
            👤 {user.username || "No Name"}
          </h3>
          
 <p className={user.online ? "online" : "offline"}> 
 {
    user.online
    ?
    "🟢 Online"
    :
    "⚪ Offline"
  }
</p>
{
  !user.online && user.lastSeen &&
  <p>
  Last seen: {user.lastSeen?.toDate
    ? user.lastSeen.toDate().toLocaleString()
    : "No data"}
</p>
}


          <div className="stats">


            <div className="stat-box">

              👥 Followers

              <h3>
                {user.followers || 0}
              </h3>

            </div>



            <div className="stat-box">

              👥 Following

              <h3>
                {user.following || 0}
              </h3>

            </div>


          </div>




          {
            user.uid !== currentUser?.uid &&

            <>


              <button
                onClick={()=>followUser(user)}
              >

              {
                currentUser?.followingList?.includes(user.uid)

                ?

                "Following ✅"

                :

                "Follow 👥"

              }

              </button>


              <button
  className="chat-btn" 

                onClick={()=>{

                  navigate("/chat?uid="+user.uid);

                }}

              >

                💬 Chat

              </button>


            </>

          }



          <hr/>


        </div>


      ))

    }


  </div>

);


}


export default Users;
