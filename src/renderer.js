console.log("Started renderer.js")

ipc.send('connect', "localhost"); // connect to localhost

const COB = {
    set: function(cobKey, value) {
        NetworkTables.putValue(cobKey, value);
    },
    get: function(cobKey, def) {
        return NetworkTables.getValue(cobKey, def);
    },
    // key: the key to use
    // f: (newValue, isNew) => ...
    setListener: function(key, f) {
        NetworkTables.addKeyListener(key, (newKey, newValue, isNew) => f(newValue, isNew), true);
    }
}

NetworkTables.addRobotConnectionListener((con) => { console.log("connected", con) }, false);


const COB_KEY = {
} // put all the keys here, and match the schema with the COB.h file in the codebase


function initAll(){
    initCPLUI();
    const field = document.getElementById("field");
    const fieldImg = document.getElementById("field-img");
    let fullscreen = false;
    field.onclick = () => {
        if(fullscreen) {
            field.style = "height: max-content; position: absolute"
        } else {            
            field.style = "max-height: 200px;";
        }
        fullscreen = !fullscreen;
        fixSizes();
    }
    function fixSizes() {
        const robot = document.getElementById("robot");
        console.log(fieldImg.clientWidth / 2);
        robot.style = "left: " + (fieldImg.clientWidth / 2) + "px;";
    }
    window.addEventListener("resize", fixSizes);

    fixSizes();
}


window.onload = () => { // this runs after the DOM has loaded


    initAll();
;
}