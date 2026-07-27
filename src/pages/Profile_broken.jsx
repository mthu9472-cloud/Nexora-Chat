import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { useNavigate, useSearchParams } from "react-router-dom";
import "./Profile.css";

function Profile(){

  const navigate = useNavigate();
    const [searchParams] = useSearchParams();

  const profileUid = searchParams.get("uid");
  const isMyProfile = !profileUid || profileUid === auth.currentUser?.uid;

  const [username,setUsername] = useState("");
  const [bio,setBio] = useState("");
  const [photo,setPhoto] = useState("");
  const [email,setEmail] = useState("");

  const [posts,setPosts] = useState([]);

  const [followers,setFollowers] = useState(0);
  const [following,setFollowing] = useState(0);

  const [followersList,setFollowersList] = useState([]);
  const [followingList,setFollowingList] = useState([]);

  const [usersData,setUsersData] = useState({});

  async function uploadPhoto(e){

  const file = e.target.files[0];

  if(!file) return;

  const user = auth.currentUser;

  if(!user){
    alert("Login First");
    return;
  }

  .upload(fileName, file, {
    upsert:true
  });


if(error){
  console.log(error);
  alert(JSON.stringify(error));
  return;
}

console.log("UPLOAD OK", fileName);

  
console.log("PHOTO URL =", data.publicUrl);

  alert("Photo uploaded");

}
  async function loadProfile(){

    const user = auth.currentUser;

    if(!user) return;

    const uid = profileUid || user.uid;
    const snap = await getDoc(
      doc(db,"users",uid)
    );


    if(snap.exists()){

      const data = snap.data();


      setUsername(data.username || "");
      setBio(data.bio || "");
      setPhoto(data.photo || "");

      setEmail(
        data.email || user.email
      );


      setFollowers(
        data.followers || 0
      );


      setFollowing(
        data.following || 0
      );


      setFollowersList(
        data.followersList || []
      );


      setFollowingList(
        data.followingList || []
      );

    }

  }



  async function loadUsers(){

    const snap = await getDocs(
      collection(db,"users")
    );


    let data = {};


    snap.forEach((item)=>{

      data[item.id] = item.data();

    });


    setUsersData(data);

  }
  async function loadPosts(){

    const user = auth.currentUser;

    if(!user) return;


    const snap = await getDocs(
      collection(db,"posts")
    );


    let data = [];


    snap.forEach((item)=>{

      const post = item.data();


      if(post.uid === user.uid){

        data.push({
          id:item.id,
          ...post
        });

      }

    });


    setPosts(data);

  }




  async function saveProfile(){

    const user = auth.currentUser;
    console.log("CURRENT PHOTO =", photo);

    if(!user){

      alert("Login First");
      return;

    }


    await setDoc(
      doc(db,"users",user.uid),
      {

        username,
        bio,
        photo,

        email:user.email,

        uid:user.uid

      },

      {
        merge:true
      }

    );


    alert("Profile Saved");

  }


  useEffect(()=>{

  const start = async()=>{

    await loadProfile();
    await loadPosts();
    await loadUsers();

  };

  start();

},[profileUid]);
  return(

    <div className="profile">

      <h1>Nexora Profile 👤</h1>


      <h2>
        {username}
      </h2>


      {email === "mthu9472@gmail.com" &&
        <h3>⭐ Founder</h3>
      }


      <p>
        📧 {email}
      </p>


       <div className="stats">

  <div className="stat-box">
    👥 Followers
    <h3>{followers}</h3>
  </div>


  <div className="stat-box">
    👥 Following
    <h3>{following}</h3>
  </div>

</div>


      <p>
        {bio}
      </p>


      {photo && (

        <img
          src={photo}
          className="profile-img"
          alt="profile"
        />

      )}


      <hr/>


      <h2>
        👥 Followers List
      </h2>


      {followersList.map((uid)=>(

        <div key={uid} className="user-card">

          <button
  onClick={()=>{
    navigate("/profile?uid="+uid)
  }}
>
  👤 {usersData[uid]?.username || uid}
</button>


          <button
            onClick={()=>{
              navigate("/chat?uid="+uid)
            }}
          >
            💬 Chat
          </button>


        </div>

      ))}

      <h2>
        👥 Following List
      </h2>


      {followingList.map((uid)=>(

        <div key={uid} className="user-card">
         <p>
            👤 {usersData[uid]?.username || uid}
          </p>


          <button
            onClick={()=>{

              navigate("/chat?uid="+uid)

            }}
          >
            💬 Chat
          </button>


        </div>

      ))}



      <hr/>


      <h2>
        📝 My Posts
      </h2>


      {
        posts.map((post)=>(

          <div
            key={post.id}
            className="post-card"
          >

            <p>
              💬 {post.text}
            </p>


            <p>
              ❤️ {post.likes || 0} Likes
            </p>


            <hr/>

          </div>

        ))
      }



      <hr/>

      {isMyProfile && (
      <div className="edit-box">
      <p>Username</p>
      <input

        placeholder="Username"

        value={username}

        onChange={(e)=>
          setUsername(e.target.value)
        }

      />


      <br/><br/>


      <input
  type="file"
  accept="image/*"
  onChange={uploadPhoto}
/>


      <br/><br/>


      <textarea

        placeholder="Bio"

        value={bio}

        onChange={(e)=>
          setBio(e.target.value)
        }

      />


      <br/><br/>


      <button onClick={saveProfile}>

        Save Profile

              </button>

      </div>

    )}

  </div>

);

}

export default Profile;
