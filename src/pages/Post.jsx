import { useState } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

function Post(){

  const [text,setText] = useState("");


  async function createPost(){

    const user = auth.currentUser;

    if(!user){
      alert("Login first");
      return;
    }

    await addDoc(collection(db,"posts"),{

      uid:user.uid,
      email:user.email,
      text:text,
      time:new Date().toISOString()

    });


    alert("Post Created");

    setText("");

  }


  return(

    <div>

      <h1>Nexora Post 📝</h1>

      <textarea
      placeholder="Write something..."
      value={text}
      onChange={(e)=>setText(e.target.value)}
      />


      <br/>


      <button onClick={createPost}>
        Post
      </button>


    </div>

  );

}


export default Post;
