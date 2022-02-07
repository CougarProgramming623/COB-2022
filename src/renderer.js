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
    document.getElementById("compile").onclick = compileCPL;
    document.getElementById("show-ast").onclick = function() {
        document.getElementById("ast").hidden = !document.getElementById("ast").hidden;
    }
}


window.onload = () => { // this runs after the DOM has loaded


    initAll();

}