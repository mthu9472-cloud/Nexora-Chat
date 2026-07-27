import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

function Profile(){

  const [username,setUsername] = useState("");
  const [bio,setBio] = useState("");
  const [photo,setPhoto] = useState("");
  const [email,setEmail] = useState("");
  const [posts,setPosts] = useState([]);

  const [followers,setFollowers] = useState(0);
  const [following,setFollowing] = useState(0);


  useEffect(()=>{
    loadProfile();
    loadPosts();
    loadFollow();
  },[]);


  async function loadProfile(){

    const user = auth.currentUser;

    if(!user) return;


    const snap = await getDoc(
      doc(db,"users",user.uid)
    );


    if(snap.exists()){

      const data = snap.data();

      setUsername(data.username || "");
      setBio(data.bio || "");
      setPhoto(data.photo || "");
      setEmail(data.email || user.email);

    }

  }



  async function loadPosts(){

    const user = auth.currentUser;

    if(!user) return;


    const snap = await getDocs(
      collection(db,"posts")
    );


    let data=[];


    snap.forEach((item)=>{

      const post=item.data();

      if(post.uid === user.uid){

        data.push({
          id:item.id,
          ...post
        });

      }

    });


    setPosts(data);

  }



  async function loadFollow(){

    const user = auth.currentUser;

    if(!user) return;


    const followersSnap = await getDocs(
      query(
        collection(db,"follows"),
        where("following","==",user.uid)
      )
    );


    const followingSnap = await getDocs(
      query(
        collection(db,"follows"),
        where("follower","==",user.uid)
      )
    );


    setFollowers(followersSnap.size);
    setFollowing(followingSnap.size);

  }




  async function saveProfile(){

    const user = auth.currentUser;


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



  return(

    <div>

      <h1>Nexora Profile 👤</h1>


      {photo && (
        <img
          src={photo}
          width="120"
          alt="profile"
        />
      )}


      <h2>{username}</h2>
      {email === "mthu9472@gmail.com" && <h3>⭐ Founder</h3>}

      <p>📧 {email}</p>

      <p>👥 Followers: {followers}</p>

      <p>👥 Following: {following}</p>


      <p>{bio}</p>


      <hr/>


      <input
        placeholder="Username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
      />


      <br/><br/>


      <input
        placeholder="Photo URL"
        value={photo}
        onChange={(e)=>setPhoto(e.target.value)}
      />


      <br/><br/>


      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e)=>setBio(e.target.value)}
      />


      <br/><br/>


      <button onClick={saveProfile}>
        Save Profile
      </button>



      <h2>My Posts 📝</h2>


      {
        posts.map((post)=>(

          <div key={post.id}>

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


    </div>

  );

}


export default Profile;
