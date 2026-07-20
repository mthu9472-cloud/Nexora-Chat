import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc
} from "firebase/firestore";

function Users(){

  const [users,setUsers] = useState([]);
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


    if(!user){
      return;
    }


    const snap = await getDoc(
      doc(db,"users",user.uid)
    );


    if(snap.exists()){

      setCurrentUser({

        uid:user.uid,

        ...snap.data(),

        followingList:
        snap.data().followingList || []

      });

    }

  }



  async function loadUsers(){

    const snap = await getDocs(
      collection(db,"users")
    );


    let data=[];


    snap.forEach((item)=>{

 const u = item.data();

data.push({

  uid:item.id,

  ...u,

  followingList: u.followingList || []

});
    });


    setUsers(data);

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

  followersList: arrayRemove(user.uid),

  followers: Math.max((target.followers || 1)-1,0)

});

await addDoc(collection(db,"notifications"),{

  ownerUid: target.uid,

  text:"👥 "+user.email+" started following you",

  from:user.email,

  time:new Date().toISOString()

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
await addDoc(collection(db,"notifications"),{

  ownerUid: target.uid,

  text:"👥 "+user.email+" started following you",

  from:user.email,

  time:new Date().toISOString()

});

    }



 await loadCurrentUser();
await loadUsers();

  }




  return(

    <div>


      <h1>Nexora Users 👥</h1>


      {
        users.map((user)=>(


          <div key={user.uid}>


            <h3>
              👤 {user.username || "No Name"}
            </h3>


            <p>
              📧 {user.email}
            </p>


            <p>
              Followers 👥 {user.followers || 0}
            </p>


            <p>
              Following 👥 {user.following || 0}
            </p>


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

            <hr/>


          </div>


        ))
      }


    </div>

  );


}


export default Users;
