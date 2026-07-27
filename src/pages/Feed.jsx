import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
collection,
query,
orderBy,
onSnapshot,
deleteDoc,
doc,
updateDoc,
arrayUnion,
addDoc,
getDocs
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


function Feed(){

  const [posts,setPosts] = useState([]);
  const [user,setUser] = useState(null);
  const [commentText,setCommentText] = useState({});
  const [comments,setComments] = useState({});
  const [users,setUsers] = useState({});


  async function loadUsers(){

    const snap = await getDocs(collection(db,"users"));

    let data={};

    snap.forEach((item)=>{

      data[item.id]=item.data();

    });

    setUsers(data);

  }



async function loadPosts(){

 const q = query(
   collection(db,"posts"),
   orderBy("time","desc")
 );

 onSnapshot(q,(snap)=>{

   let data=[];

   snap.forEach((item)=>{

     data.push({
       id:item.id,
       ...item.data()
     });

   });

   setPosts(data);

 });

 loadComments();
 loadUsers();

}



async function loadComments(){

  const q = query(collection(db,"comments"));

  onSnapshot(q,(snap)=>{

    let data={};

    snap.forEach((item)=>{

      const c=item.data();

      if(!data[c.postId]){

        data[c.postId]=[];

      }

      data[c.postId].push(c);

    });

    setComments(data);

  });

}



  useEffect(()=>{


    const unsubscribe =
    onAuthStateChanged(auth,(currentUser)=>{

      setUser(currentUser);

    });


    loadPosts();


    setTimeout(()=>{


      const id = window.location.hash.replace("#","");


      if(id){


        const element=document.getElementById(id);


        if(element){

          element.scrollIntoView();

        }


      }


    },1000);



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
    if(post.uid && post.uid !== user.uid){

      await addDoc(collection(db,"notifications"),{

        ownerUid:post.uid,

        postId:post.id,

        text:"❤️ Your post got a like",

        from:user.email,

        time:new Date().toISOString()

      });

    }




  }

  async function reactPost(post,type){
  
  alert(post.id + " " + type);

  if(!user){

    alert("Login First");

    return;

  }


  let reactions = post.reactions || {
    like:0,
    love:0,
    haha:0,
    care:0
  };


  reactions[type] = (reactions[type] || 0) + 1;


  await updateDoc(doc(db,"posts",post.id),{

    reactions:reactions

  });

}

  async function addComment(postId){


    if(!user){

      alert("Login First");

      return;

    }


    const text=commentText[postId];


    if(!text){

      return;

    }


    const post=posts.find(p=>p.id===postId);



    await addDoc(collection(db,"comments"),{


      postId:postId,

      uid:user.uid,

      email:user.email,

      text:text,

      time:new Date().toISOString()


    });



    if(post && post.uid !== user.uid){


      await addDoc(collection(db,"notifications"),{


        ownerUid:post.uid,

        postId:postId,

        text:"💬 Your post got a comment",

        from:user.email,

        time:new Date().toISOString()


      });


    }



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




    }else{


      alert("No Permission");


    }


  }



  return(

    <div>


      <h1>Nexora Feed 📝</h1>


      {

        posts.map((post)=>(


          <div

            key={post.id}

            id={"post-"+post.id}

          >


            👤 {post.email}


            <br/>


            💬 {post.text}


            <br/>


            ❤️ {post.likes || 0} Likes


            <br/>

            
            <div>
👍 {post.reactions?.like || 0}
❤️ {post.reactions?.love || 0}
🤣 {post.reactions?.haha || 0}
🥰 {post.reactions?.care || 0}
</div>

<br/>

          <b>Liked by ❤️</b>

            {
              post.likedBy?.map((uid,index)=>(

                <p key={index}>

                  👤 {users[uid]?.email || uid}

                </p>

              ))
            }


            🕒 {post.time}

            <br/><br/>


            <button onClick={()=>reactPost(post,"like")}>
  👍 Like
</button>

<button onClick={()=>reactPost(post,"love")}>
  ❤️ Love
</button>

<button onClick={()=>reactPost(post,"haha")}>
  🤣 Haha
</button>

<button onClick={()=>reactPost(post,"care")}>
  🥰 Care
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
