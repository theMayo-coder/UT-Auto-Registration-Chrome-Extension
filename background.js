//runs when chrome is installed
chrome.runtime.onInstalled.addListener(() => {
    //console.log("running when chrome installed")
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

let loading;
let tid;

//define change load Status function to use in a global scope
function changeLoadStatus(tabId, changeInfo, tab){
    if(tabId === tid) {
        if(changeInfo.status === "complete") {
            loading = false
        } else {
            loading = true
        }
    }
}

//get load status of tab func
function getLoadStatus(){
    return new Promise((resolve, reject) => {
        chrome.tabs.get(tid, (tab) => {
            if(tab.status == "loading") {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}

//create async function to run continuousReload
async function continuousReload(tabId) {
    //check has listener and update loading status
    if(!chrome.tabs.onUpdated.hasListener(changeLoadStatus)) {

        console.log("in the continuous reload function")

        tid = tabId
        chrome.tabs.onUpdated.addListener(changeLoadStatus);
        loading = await getLoadStatus(tid);

        //actual code of the continuous reload handler
        if(tid) {
            //set endtime
            const endTime = Date.now() + 5000

            //setting interval for reload
            const callTimer = setInterval(() => {
                if(Date.now() >= endTime) {
                    //clear interval and remove the listener 
                    clearInterval(callTimer);
                    chrome.tabs.onUpdated.removeListener(changeLoadStatus)
                    console.log("5 seconds over");
                } else {
                    console.log("reloading the page if not alr loading")
                    if(!loading) {
                        chrome.tabs.reload(tid)
                    }
                }
            }, 1000);
        }
    } else {
        console.log("loading aleady taking place, please wait for continous reload to complete")
    }
}

//keep requesting a site until it is reached for 20 sec max
async function websiteReload(tabId, website) {
    //check has listener and update loading status
    if(!chrome.tabs.onUpdated.hasListener(changeLoadStatus)) {

        console.log("in the continuous reload function")

        tid = tabId
        chrome.tabs.onUpdated.addListener(changeLoadStatus);
        loading = await getLoadStatus(tid);

        //actual code of the continuous reload handler
        if(tid) {
            //set endtime
            const endTime = Date.now() + 20000

            //setting interval for reload
            const callTimer = setInterval(() => {
                if(Date.now() >= endTime) {
                    //clear interval and remove the listener 
                    clearInterval(callTimer);
                    chrome.tabs.onUpdated.removeListener(changeLoadStatus)
                    console.log("5 seconds over");
                } else {
                    //reloading page if not loading
                    if(!loading) {
                        //if site is reached end loading period
                        if(window.location == website){
                            //clear interval and remove the listener 
                            clearInterval(callTimer);
                            chrome.tabs.onUpdated.removeListener(changeLoadStatus)
                        } else {
                            //navigate to site
                            window.location = website
                        }
                    }
                }
            }, 2000);
        }
    } else {
        alert("loading aleady taking place, please wait for continous reload to complete")
    }
}

//chrome scripting func to enter + submit a class
function enterAndSubmit(cl) {
    chrome.scripting.executeScript({
        target: {tabId: tid},
        func: (className) => {

            //get elements from page
            const radioBox = document.getElementById("ds_request_STADD");
            const classBox = document.getElementById("s_unique_add");
            const searchForm = document.getElementById("regform");

            //if all elements exist, enter next class and submit form
            if(radioBox && classBox && searchForm){
                radioBox.checked = true
                classBox.value = className
                searchForm.submit()
            } else {
                alert("element not found")
            }

        },
        args: [cl]
    })
}

//classNum variable to keep track of entered classes
let classNum = 0

//function to auto enter classes
function autoEnterClasses(tabId, classesList) {

    //set classNUm and tabId variables
    classNum = 0
    tid = tabId

    //function to add to listener
    //enter all classes and wait for page to reload before consecutive entries
    function keepEntering(tabId, changeInfo) {
        //check tab 
        if(tabId == tid && classNum<classesList.length && changeInfo.status == "complete") {

            enterAndSubmit(classesList[classNum])
            classNum++;
        
        //if classNum surpasses indexes, remove listener and stop process
        } else if(classNum>=classesList.length) {
            chrome.tabs.onUpdated.removeListener(keepEntering)
        }
    }

    //add keepEntering func to run when tabs update
    chrome.tabs.onUpdated.addListener(keepEntering) 

    //start process by calling enterAndSubmit, and classesList is guarenteed to have at least one class
    enterAndSubmit(classesList[0])

}



//other listener
chrome.runtime.onMessage.addListener((message, sender, sendRes) => {

    //reloading tabs (hopefully) functional handler
    if(message.action === "continuousReload") {
        continuousReload(message.tabId)
    }

    if(message.action === "websiteReload") {
        websiteReload(message.tabId, message.website)
    }

    if(message.action === "autoEnterClasses") {
        autoEnterClasses(message.tabId, message.classesList)
    }

})




//this only works when there is no pop up enabled, but it doesn't work for now:

// chrome.action.onClicked.addListener(tab => {
//     chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         func: () => {
//             alert("hey");
//         }
//     });
// });
