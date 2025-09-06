
const datePassed = "21:42"
const hour = parseInt(datePassed.substring(0,2))
const minute = parseInt(datePassed.substring(3))

const curDate = new Date()
const timeUntil = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), hour, minute) - curDate;

console.log(curDate)
console.log(new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), hour, minute))
console.log(timeUntil)

if(timeUntil>=0) {
    setTimeout(() =>{
        console.log("")
        console.log("IT IS TIME CRAZy")
    }, timeUntil)
}

function runFuncAtTime(hour, minute, func) {
    const curDate = new Date()
    const timeUntil = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), hour, minute) - curDate;

    if(timeUntil>=0) {
        setTimeout(() =>{
            func()
        }, timeUntil)
    }
}


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
