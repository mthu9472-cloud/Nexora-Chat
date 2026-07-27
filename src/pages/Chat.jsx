import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db, auth, storage } from "../firebase/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";


function Chat(){

  const [searchParams] = useSearchParams();

  const [message,setMessage] = useState("");
  const [messages,setMessages] = useState([]);
  const [chatUser,setChatUser] = useState(null);
  const [myUsername,setMyUsername] = useState("");
  const [image,setImage] = useState(null);

  const chatUid = searchParams.get("uid");

  const chatRoomId =
    [auth.currentUser.uid, chatUid]
    .sort()
    .join("_");


  useEffect(()=>{

    if(!chatUid) return;

    getDoc(doc(db,"users",chatUid))
    .then((snap)=>{
      if(snap.exists()){
        setChatUser(snap.data());
      }
    });

  },[chatUid]);


  useEffect(()=>{

    if(!auth.currentUser) return;

    getDoc(doc(db,"users",auth.currentUser.uid))
    .then((snap)=>{
      if(snap.exists()){
        setMyUsername(
          snap.data().username
        );
      }
    });

  },[]);
  useEffect(()=>{

    if(!auth.currentUser) return;

    const q = query(
      collection(db,"chats",chatRoomId,"messages"),
      orderBy("time","asc")
    );


    const unsub = onSnapshot(q,(snapshot)=>{

      setMessages(
        snapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data()
        }))
      );

    });


    return ()=>unsub();

  },[]);



  const sendMessage = async()=>{

    try{

      if(!message.trim() && !image) return;

      if(!myUsername) return;


      let imageUrl = "";


      if(image){

        const imageRef =
          ref(
            storage,
            "chatImages/" + image.name
          );


        await uploadBytes(
          imageRef,
          image
        );


        imageUrl =
          await getDownloadURL(
            imageRef
          );

      }


      await addDoc(
        collection(
          db,
          "chats",
          chatRoomId,
          "messages"
        ),
        {
          text:message,
          username:myUsername,
          uid:auth.currentUser.uid,
          users:[
            auth.currentUser.uid
          ],
          imageUrl:imageUrl,
          time:serverTimestamp()
        }
      );


      setMessage("");
      setImage(null);


    }catch(error){

      console.log(error);
      alert(error.message);

    }

  };
  return (

    <div
      style={{
        maxWidth:"500px",
        margin:"auto"
      }}
    >

      <h2>💬 Nexora Chat TEST</h2>

      <h3>
        👤 {chatUser?.username || chatUser?.email || "User"}
      </h3>
      <p>
  {
    chatUser?.online
    ?
    "🟢 Online"
    :
    "⚪ Offline"
  }
</p>

      <div>

        {messages.map((msg)=>{

          const mine =
            msg.uid === auth.currentUser?.uid;


          return (

            <div
              key={msg.id}
              style={{
                textAlign: mine ? "right":"left",
                margin:"10px"
              }}
            >

              {!mine && (
                <>
                  <b>
                    👤 {msg.username || "User"}
                  </b>
                  <br/>
                </>
              )}


              <div
                style={{
                  display:"inline-block",
                  background: mine ? "#0084ff":"#eee",
                  color: mine ? "white":"black",
                  padding:"10px 15px",
                  borderRadius:"15px"
                }}
              >

                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="chat"
                    style={{
                      width:"200px",
                      borderRadius:"15px"
                    }}
                  />
                )}

                <br/>

                {msg.text}

              </div>


              <br/>

              <small style={{color:"gray"}}>
                {msg.time?.toDate().toLocaleTimeString()}
              </small>


            </div>

          );

        })}

      </div>



      <input
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        placeholder="Write message..."
      />


      <input
        type="file"
        accept="image/*"
        onChange={(e)=>setImage(e.target.files[0])}
      />


      <button
        type="button"
        onClick={sendMessage}
      >
        Send 💬
      </button>


    </div>

  );

}


export default Chat;
