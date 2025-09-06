
//give an alert from the background 
async function giveAlert(al) {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: (msg) => {
            alert(msg);
        },
        args: [al]
    });
}

//reload the page
async function reloadPage() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.reload(tab.id);
}

//searching function for amazon (made as a test to manipulate DOM content)
async function searchAmazon(data) {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},

        //scripting function to execute
        func: (msg, url) => {

            function run() {
                //creating a url object from url
                const newUrl = new URL(url)
                console.log(newUrl.hostname);

                //check if it's the right url
                if(newUrl.hostname === "www.amazon.com"){
                    const searchBox = document.getElementById("twotabsearchtextbox");
                    const searchForm = document.getElementById("nav-search-bar-form");

                    if(searchBox && searchForm){
                        searchBox.value = msg;
                        searchForm.submit();
                    } else {
                        alert("search bar and search button not found")
                    }

                } else{
                    alert("Current website is not amazon");
                }

            }
            
            //make sure document is not loading while calling function
            if(document.readyState == "loading") {
                window.addEventListener("DOMContentLoaded", () => {
                    run();
                })
            } else {
                run();
            }

        },
        args: [data, tab.url]
    });
}

//refresh continually function
async function autoRefresh() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    //background.js deals with continual refresh
    chrome.runtime.sendMessage({
        action: "continuousReload",
        tabId: tab.id
    });
}

//add to popup list function
function addClass(cls) {
    const newListItem = document.createElement("li")
    const newDiv = document.createElement("div")
    const content = document.createTextNode(cls)

    //append each child and add class to every div
    newDiv.appendChild(content)
    newDiv.classList.add("listElementDiv")
    newListItem.appendChild(newDiv)

    //add list element
    document.getElementById("classeslist").appendChild(newListItem);

    //when clicked, list elements will remove themselves
    newListItem.addEventListener('click', function () {
        this.remove();
    })
}

//run any given function at a specific time today (if it is past current time)
let funcCalled = false;
function runFuncAtTime(hour, minute, future, past) {
    const curDate = new Date();
    const timeUntil = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), hour, minute) - curDate;

    if(!funcCalled) {
        if(timeUntil>=0) {

            funcCalled = true;

            setTimeout(() =>{
                future();
                funcCalled = false;
            }, timeUntil);

        } else {
            past();
        }
    } else {
        alert("function was already called, wait until it has completed");
    }
    
}


document.getElementById("mainsubmit").addEventListener("click", reloadPage);

document.getElementById("refreshbutton").addEventListener("click", () => {
    autoRefresh();
});


//handle the form submission for amazon search
const listItems = document.getElementById("classeslist").getElementsByTagName("li")
document.getElementById("searchform").addEventListener("submit", (event) => {
    event.preventDefault(); 

    //get data from form
    const formData = new FormData(event.target);
    const search = formData.get('fsearch');
    const time = formData.get('ftime')

    //extract hour and minute from time
    const hour = parseInt(time.substring(0, 2))
    const minute = parseInt(time.substring(3))

    document.getElementById("additionalFuncDiv").style.backgroundColor = 'rgb(197, 174, 134)';
    runFuncAtTime(hour, minute, () => {
        document.getElementById("additionalFuncDiv").style.backgroundColor = 'rgb(255, 237, 206)';
        searchAmazon(search)
    }, () => {
        alert("enter a time later today please");
    })

});

//handle submitting class
document.getElementById("classesform").addEventListener("submit", (event) => {
    event.preventDefault(); 
    const formData = new FormData(event.target);
    const cls = formData.get('fclass');
    addClass(cls)
});

//--------------------------------------------------------------------------------------------------------------------------------------------

//adding and submitting classes function
async function addAndSubmitClasses() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    let liItems = Array.from(listItems)
    liItems = liItems.map(item => {
        return item.innerText
    }) 

    //check all elements and that class list has a length greater than 0
    if(liItems.length>0) {
        //background.js deals with entering classes
        chrome.runtime.sendMessage({
            action: "autoEnterClasses",
            tabId: tab.id,
            classesList: liItems,
        });
    }
}

//keep loading a specific website until it doesn't redirect to another site
async function navigateSite(web) {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    //background.js deals with reaching site
    chrome.runtime.sendMessage({
        action: "websiteReload",
        tabId: tab.id,
        website: web
    });
}

//handle submitting classes at specific time
document.getElementById("button4").addEventListener("click", async (event) => {
    event.preventDefault(); 

    //get time data
    const time = formData.get('fclasstime')

    //extract hour and minute from time
    const hour = parseInt(time.substring(0, 2))
    const minute = parseInt(time.substring(3))
    
    //navigate to site
    await navigateSite("https://utdirect.utexas.edu/registration/registration.WBX")
    
    //checks if navigateSite went through and proper link is reached
    if(window.location == "https://utdirect.utexas.edu/registration/registration.WBX") {

        //change color of bg to let user know function started
        document.getElementById("mainClassesDiv").style.backgroundColor = 'rgb(197, 174, 134)';

        //adds and submits the classes at the registration time
        runFuncAtTime(hour, minute, () => {
            //change back backgroundColor after classes added
            document.getElementById("mainClassesDiv").style.backgroundColor = 'rgb(255, 237, 206)';

            //adds and submits classes
            //pulls the classes from the popup html
            addAndSubmitClasses()
        }, () => {
            alert("enter a time later today please");
        })
    }

});




