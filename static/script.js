// =========================
// ELEMENTS
// =========================

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

const newChatBtn = document.getElementById("new-chat-btn");
const conversationList = document.getElementById("conversation-list");
const deleteAllBtn = document.getElementById("delete-all-btn");

const themeBtn = document.getElementById("theme-btn");

const searchHistory = document.getElementById("search-history");

const personaSelect = document.getElementById("persona-select");

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("close-sidebar");

const welcome = document.getElementById("welcome");

let currentChatId = null;
let allHistory = [];


// =========================
// SIDEBAR
// =========================

menuBtn.onclick = () => {
    sidebar.classList.add("active");
};

closeSidebar.onclick = () => {
    sidebar.classList.remove("active");
};

document.addEventListener("click",(e)=>{

    if(
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){
        sidebar.classList.remove("active");
    }

});


// =========================
// SEND BUTTON
// =========================

sendBtn.onclick = sendMessage;

userInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});


// =========================
// NEW CHAT
// =========================

newChatBtn.onclick = ()=>{

    currentChatId = null;

    welcome.style.display = "flex";

    chatBox.innerHTML = `

    <div class="bot-message message">

        <div class="avatar">
            🤖
        </div>

        <div class="message-content">

            💜 Welcome to NeedBot!

            <br><br>

            Ask me anything to start a new conversation.

        </div>

    </div>

    `;

};


// =========================
// SEND MESSAGE
// =========================

async function sendMessage(){

    const message = userInput.value.trim();

    if(!message) return;

    addUserMessage(message);

    userInput.value="";

    welcome.style.display="none";

    const bot=document.createElement("div");

    bot.className="bot-message message";

    bot.innerHTML=`

        <div class="avatar">
            🤖
        </div>

        <div class="message-content">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;

    chatBox.appendChild(bot);

    chatBox.scrollTop=chatBox.scrollHeight;

    const content=bot.querySelector(".message-content");

    try{

        const response=await fetch("/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                message:message,

                chat_id:currentChatId,

                persona:personaSelect.value

            })

        });

        const data=await response.json();

        currentChatId=data.chat_id;

        content.innerHTML="";

        let words=data.reply.split(" ");

        let index=0;

        let output="";

        let typing=setInterval(()=>{

            if(index<words.length){

                output+=words[index]+" ";

                content.innerHTML=marked.parse(output);

                index++;

                chatBox.scrollTop=chatBox.scrollHeight;

            }

            else{

                clearInterval(typing);

                addCopyButton(bot,data.reply);

            }

        },30);

        loadHistory();

    }

    catch(error){

        console.error(error);

        content.innerHTML=`
            <span style="color:#ff9eb5;">
                ❌ Unable to connect to the server.
            </span>
        `;

    }

}

// =========================
// USER MESSAGE
// =========================

function addUserMessage(text){

    const div=document.createElement("div");

    div.className="user-message message";

    div.innerHTML=`

        <div class="message-content">

            ${text}

        </div>

    `;

    chatBox.appendChild(div);

    chatBox.scrollTop=chatBox.scrollHeight;

}


// =========================
// LOAD HISTORY
// =========================

async function loadHistory(){

    const response=await fetch("/history");

    allHistory=await response.json();

    displayHistory(allHistory);

}


// =========================
// DISPLAY HISTORY
// =========================

function displayHistory(history){

    conversationList.innerHTML="";

    if(history.length===0){

        conversationList.innerHTML="<p>No conversations yet</p>";

        return;

    }

    history.forEach(chat=>{

        const div=document.createElement("div");

        div.className="history-item";

        div.innerHTML=`

            <div class="history-row">

                <span class="chat-title">
                    💬 ${chat.title}
                </span>

                <button class="history-dots">
                    ⋮
                </button>

            </div>

            <div class="history-menu" style="display:none;">

                <button class="rename-btn">
                    ✏ Rename
                </button>

                <button class="small-delete-btn">
                    🗑 Delete
                </button>

            </div>

        `;

        // Open Chat

        div.querySelector(".chat-title").onclick=()=>{

            openChat(chat.id);

        };

        // Three Dots

        const dots=div.querySelector(".history-dots");
        const menu=div.querySelector(".history-menu");

        dots.onclick=(e)=>{

            e.stopPropagation();

            menu.style.display=

            menu.style.display==="flex"

            ?

            "none"

            :

            "flex";

        };

        // Rename

        div.querySelector(".rename-btn").onclick=async(e)=>{

            e.stopPropagation();

            const name=prompt(

                "Rename Conversation",

                chat.title

            );

            if(name){

                await fetch(

                    "/history/"+chat.id+"/rename",

                    {

                        method:"PUT",

                        headers:{
                            "Content-Type":"application/json"
                        },

                        body:JSON.stringify({

                            title:name

                        })

                    }

                );

                loadHistory();

            }

        };

        // Delete One

        div.querySelector(".small-delete-btn").onclick=async(e)=>{

            e.stopPropagation();

            if(confirm("Delete this conversation?")){

                await fetch(

                    "/history/"+chat.id,

                    {

                        method:"DELETE"

                    }

                );

                if(currentChatId===chat.id){

                    currentChatId=null;

                }

                loadHistory();

            }

        };

        conversationList.appendChild(div);

    });

}


// =========================
// SEARCH HISTORY
// =========================

searchHistory.onkeyup=()=>{

    const value=searchHistory.value.toLowerCase();

    const filtered=allHistory.filter(chat=>

        chat.title.toLowerCase().includes(value)

    );

    displayHistory(filtered);

};


// =========================
// OPEN CHAT
// =========================

async function openChat(id){

    const response=await fetch("/history/"+id);

    const chat=await response.json();

    currentChatId=id;

    welcome.style.display="none";

    chatBox.innerHTML="";

    chat.messages.forEach(msg=>{

        const div=document.createElement("div");

        if(msg.role==="user"){

            div.className="user-message message";

            div.innerHTML=`

                <div class="message-content">

                    ${msg.content}

                </div>

            `;

        }

        else{

            div.className="bot-message message";

            div.innerHTML=`

                <div class="avatar">

                    🤖

                </div>

                <div class="message-content">

                    ${marked.parse(msg.content)}

                </div>

            `;

            addCopyButton(div,msg.content);

        }

        chatBox.appendChild(div);

    });

    chatBox.scrollTop=chatBox.scrollHeight;

}
// =========================
// DELETE ALL
// =========================

deleteAllBtn.onclick = async()=>{

    if(confirm("Delete all conversations?")){

        await fetch("/history",{
            method:"DELETE"
        });

        currentChatId = null;

        loadHistory();

        welcome.style.display = "flex";

        chatBox.innerHTML = `

        <div class="bot-message message">

            <div class="avatar">
                🤖
            </div>

            <div class="message-content">

                💜 Welcome to NeedBot!

                <br><br>

                Ask me anything to start a new conversation.

            </div>

        </div>

        `;

    }

};


// =========================
// COPY BUTTON
// =========================

function addCopyButton(div,text){

    const button=document.createElement("button");

    button.className="copy-btn";

    button.innerHTML="📋 Copy";

    button.onclick=()=>{

        navigator.clipboard.writeText(text);

        button.innerHTML="✅ Copied";

        setTimeout(()=>{

            button.innerHTML="📋 Copy";

        },1500);

    };

    div.querySelector(".message-content").appendChild(button);

}


// =========================
// DARK MODE
// =========================

themeBtn.onclick=()=>{

    document.body.classList.toggle("dark");

    const dark=document.body.classList.contains("dark");

    themeBtn.innerHTML=dark ? "☀️" : "🌙";

    localStorage.setItem(

        "theme",

        dark ? "dark" : "light"

    );

};


// =========================
// LOAD SAVED THEME
// =========================

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    themeBtn.innerHTML="☀️";

}


// =========================
// AUTO FOCUS INPUT
// =========================

window.onload=()=>{

    loadHistory();

    userInput.focus();

};


// =========================
// ESC CLOSE SIDEBAR
// =========================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        sidebar.classList.remove("active");

    }

});


// =========================
// START
// =========================

loadHistory();