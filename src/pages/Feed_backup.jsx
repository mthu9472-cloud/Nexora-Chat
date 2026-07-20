import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


function Feed(){

  const [posts,setPosts] = useState([]);
  const [user,setUser] = useState(null);
  const [commentText,setCommentText] = useState({});
  const [comments,setComments] = useState({});


  async function loadPosts(){

    const snap = await getDocs(collection(db,"posts"));

    let data=[];

    snap.forEach((item)=>{

      data.push({
        id:item.id,
        ...item.data()
      });

    });

    setPosts(data);

    loadComments();

  }



  async function loadComments(){

    const snap = await getDocs(collection(db,"comments"));

    let data={};


    snap.forEach((item)=>{

      const c = item.data();

      if(!data[c.postId]){
        data[c.postId]=[];
      }

      data[c.postId].push(c);

    });


    setComments(data);

  }



  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(auth,(currentUser)=>{

      setUser(currentUser);

    });


    loadPosts();


    return ()=>unsubscribe();


  },[]);




  async function likePost(post){

    if(!user){

      alert("Login First");

      return;

    }


    if(post.likedBy?.includes(user.uid)){

      alert("Already Liked");

      return;

    }


    await updateDoc(doc(db,"posts",post.id),{

      likes:(post.likes || 0)+1,

      likedBy:arrayUnion(user.uid)

    });


    loadPosts();

  }




  async function addComment(postId){

    if(!user){

      alert("Login First");

      return;

    }


    const text = commentText[postId];


    if(!text){

      return;

    }


    await addDoc(collection(db,"comments"),{

      postId:postId,

      uid:user.uid,

      email:user.email,

      text:text,

      time:new Date().toISOString()

    });


    setCommentText({

      ...commentText,

      [postId]:""

    });


    loadComments();

  }




  async function deletePost(post){

    if(
      user &&
      (
        user.uid === post.uid ||
        user.email === "mthu9472@gmail.com"
      )
    ){

      await deleteDoc(doc(db,"posts",post.id));

      alert("Post Deleted");

      loadPosts();


    }else{

      alert("No Permission");

    }

  }




  return(

    <div>

      <h1>Nexora Feed 📝</h1>


      {
        posts.map((post)=>(

          <div key={post.id}>


            👤 {post.email}

            <br/>

            💬 {post.text}

            <br/>

            ❤️ {post.likes || 0} Likes

            <br/>

            🕒 {post.time}

            <br/><br/>


            <button onClick={()=>likePost(post)}>
              ❤️ Like
            </button>


            <button onClick={()=>deletePost(post)}>
              Delete
            </button>


            <br/><br/>


            <input
            placeholder="Write comment..."
            value={commentText[post.id] || ""}
            onChange={(e)=>
              setCommentText({
                ...commentText,
                [post.id]:e.target.value
              })
            }
            />


            <button onClick={()=>addComment(post.id)}>
              💬 Comment
            </button>


            <h4>Comments 💬</h4>


            {
              comments[post.id]?.map((c,index)=>(

                <p key={index}>

                  👤 {c.email}

                  <br/>

                  {c.text}

                </p>

              ))
            }


            <hr/>


          </div>

        ))
      }


    </div>

  );

}


export default Feed;
